const axios = require("axios");
const cheerio = require("cheerio");

function formatDateForUrl(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function cleanText(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function parseMenuTitle(title) {
    const text = cleanText(title);
    const [namePart = text, pricePart = ""] = text.split(" - ");
    const match = namePart.match(/^(.+?)\((.+?)\)$/);

    if (!match) {
        return {
            raw: text,
            name: text,
            type: null,
            price: null,
        };
    }

    return {
        raw: text,
        name: cleanText(match[1]),
        type: cleanText(match[2]),
        price: Number(pricePart.replace(/[^\d]/g, "")) || null,
    };
}

function parseMenuItems($, li) {
    let text = "";

    $(li)
        .contents()
        .each((_, node) => {
            if (node.type === "tag" && node.name === "br") {
                text += "\n";
                return;
            }

            text += $(node).text();
        });

    return text
        .split("\n")
        .map((item) => cleanText(item))
        .filter(Boolean);
}

function parseMealCell($, td) {
    const items = $(td).find("ul.menu-list > li");

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
    const cells = $(row).children("td");
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

async function main() {
    const date = new Date();
    const url = `https://kid.kau.ac.kr/menu_weekly_sub.asp?value3=k&value2=10&value1=${formatDateForUrl(date)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });
    const html = Buffer.from(response.data).toString("utf8");
    const $ = cheerio.load(html);

    const days = $("tbody > tr")
        .map((_, row) => parseDayRow($, row))
        .get()
        .filter((day) => day.date);

    console.log(`source: ${url}`);
    console.log(`fetchedAt: ${new Date().toISOString()}`);
    console.log("");

    days.forEach((day) => {
        console.log(`📅 ${day.date}`);

        day.meals.forEach((meal) => {
            console.log(`  - ${meal.name} (${meal.type}) / ${meal.price?.toLocaleString() ?? "-"}원 / ${meal.time ?? "시간 없음"}`);
            meal.menus.forEach((menu) => {
                console.log(`      • ${menu}`);
            });
        });

        console.log("");
    });
}

main().catch((error) => {
    console.error("메뉴 데이터를 가져오는 중 오류가 발생했습니다.");
    console.error(error.message);
    process.exit(1);
});

