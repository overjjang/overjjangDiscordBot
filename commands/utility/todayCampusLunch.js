const { SlashCommandBuilder, MessageFlags, TextDisplayBuilder, SeparatorBuilder, ContainerBuilder } = require('discord.js');
const cheerio = require('cheerio');

const fetchImpl = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const KST_TIME_ZONE = 'Asia/Seoul';

function getKstNow() {
    return new Date();
}

function formatDateForUrl(date) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: KST_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
    const year = parts.year;
    const month = parts.month;
    const day = parts.day;

    return `${year}-${month}-${day}`;
}

function cleanText(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function formatDateLabel(date) {
    const formatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: KST_TIME_ZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return formatter.format(date).replace(/\s+/g, ' ');
}

function isWeekendKst(date) {
    const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: KST_TIME_ZONE,
        weekday: 'short',
    }).format(date);

    return weekday === 'Sat' || weekday === 'Sun';
}

function parseMenuTitle(title) {
    const text = cleanText(title);
    const [namePart = text, pricePart = ''] = text.split(' - ');
    const match = namePart.match(/^(.+?)\((.+?)\)$/);

    if (!match) {
        return {
            raw: text,
            name: text,
            type: null,
            price: Number(pricePart.replace(/[^\d]/g, '')) || null,
        };
    }

    return {
        raw: text,
        name: cleanText(match[1]),
        type: cleanText(match[2]),
        price: Number(pricePart.replace(/[^\d]/g, '')) || null,
    };
}

function parseMenuItems($, li) {
    let text = '';

    $(li)
        .contents()
        .each((_, node) => {
            if (node.type === 'tag' && node.name === 'br') {
                text += '\n';
                return;
            }

            text += $(node).text();
        });

    return text
        .split('\n')
        .map((item) => cleanText(item))
        .filter(Boolean);
}

function parseMealCell($, td) {
    const items = $(td).find('ul.menu-list > li');

    if (!items.length) {
        return null;
    }

    const title = parseMenuTitle($(items.get(0)).text());
    const menus = items.length > 1 ? parseMenuItems($, items.get(1)) : [];
    const time = items.length > 2 ? cleanText($(items.get(2)).text()) : null;

    return {
        ...title,
        menus,
        time,
    };
}

function parseDayRow($, row) {
    const cells = $(row).children('td');
    const dateText = cleanText($(cells.get(0)).text());
    const mealCells = [];

    cells.slice(1).each((_, td) => {
        const meal = parseMealCell($, td);
        if (meal) {
            mealCells.push(meal);
        }
    });

    return {
        date: dateText,
        meals: mealCells,
    };
}

function normalizeDateText(text) {
    return cleanText(text).replace(/\s+/g, '').toLowerCase();
}

function matchesKstDate(dateText, date) {
    const normalizedText = normalizeDateText(dateText);
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: KST_TIME_ZONE,
        month: '2-digit',
        day: '2-digit',
    });
    const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
    const month = Number(parts.month);
    const day = Number(parts.day);

    const candidates = [
        `${month}/${day}`,
        `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
        `${month}.${day}`,
        `${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`,
        `${month}-${day}`,
        `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        `${month}월${day}일`,
        `${String(month).padStart(2, '0')}월${String(day).padStart(2, '0')}일`,
    ];

    return candidates.some((candidate) => normalizedText.includes(candidate.replace(/\s+/g, '').toLowerCase()));
}

function getMealSlotOrder(date) {
    return isWeekendKst(date)
        ? ['중식', '석식']
        : ['조식', '중식', '석식'];
}

function normalizeMealName(name) {
    return cleanText(name).replace(/\s+/g, '');
}

function getMealsBySlot(meals, slot) {
    const normalizedSlot = normalizeMealName(slot);

    return meals.filter((meal) => normalizeMealName(meal.name).startsWith(normalizedSlot));
}

function buildMealEntryContent(meal) {
    const menuText = meal.menus.length
        ? meal.menus.join('\n')
        : '메뉴 정보 없음';

    const title = meal.type || meal.name || '메뉴';
    return `**${title}**\n${menuText}`;
}

function buildMealSectionContent(slot, meals) {
    if (!meals.length) {
        return `### ${slot}\n정보 없음`;
    }


    return [
        `### ${slot}`,
        ...meals.map((meal) => buildMealEntryContent(meal)),
    ].join('\n\n');
}

function buildLunchContainer(today, meals) {
    const slots = getMealSlotOrder(today);
    const container = new ContainerBuilder();
    container.setAccentColor(0x00fff7);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 🍽️ 오늘학식'),
        new TextDisplayBuilder().setContent(`**조회일** : ${formatDateLabel(today)}\n**기준** : KST`),
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    const sections = slots.map((slot) => ({
        slot,
        meals: getMealsBySlot(meals, slot),
    }));

    sections.forEach((section, index) => {
        if (index > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(buildMealSectionContent(section.slot, section.meals)),
        );
    });


    return container;
}

async function fetchCampusLunchPage(date) {
    const url = `https://kid.kau.ac.kr/menu_weekly_sub.asp?value3=k&value2=10&value1=${formatDateForUrl(date)}`;
    const response = await fetchImpl(url);

    if (!response.ok) {
        throw new Error(`학식 페이지 요청 실패: ${response.status} ${response.statusText}`);
    }

    const html = Buffer.from(await response.arrayBuffer()).toString('utf8');
    const $ = cheerio.load(html);

    const days = $('tbody > tr')
        .map((_, row) => parseDayRow($, row))
        .get()
        .filter((day) => day.date);

    return { url, days };
}

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('오늘학식')
        .setNameLocalizations({
            ko: '오늘학식',
            'en-US': 'today-campus-lunch',
        })
        .setDescription('오늘의 학식 정보를 확인합니다')
        .setDescriptionLocalizations({
            ko: '오늘의 한국항공대학교의 학식 정보를 확인합니다',
            'en-US': 'Check today KAU lunch menu',
        }),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const today = getKstNow();
            const { days } = await fetchCampusLunchPage(today);
            const todayRow = days.find((day) => matchesKstDate(day.date, today))
                || days.find((day) => day.meals.length > 0)
                || null;

            if (!todayRow) {
                return interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent('## 오늘학식'),
                                new TextDisplayBuilder().setContent('학식 정보를 찾지 못했습니다. 잠시 후 다시 시도해주세요.'),
                            ),
                    ],
                });
            }

            const container = buildLunchContainer(today, todayRow.meals);

            return interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
            });
        } catch (error) {
            console.error('오늘학식 명령어 실행 중 오류가 발생했습니다.', error);
            return interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('## 오늘학식'),
                            new TextDisplayBuilder().setContent(`학식 정보를 가져오는 중 오류가 발생했습니다.\n${error.message ?? '알 수 없는 오류'}`),
                        ),
                ],
            });
        }
    },
};

