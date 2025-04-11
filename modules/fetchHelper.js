const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Fetch data from a given URL and parse the response as JSON.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<Object>} - The parsed JSON response.
 * @throws {Error} - Throws an error if the fetch fails or if the response is not ok.
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from URL: ${url}`, error);
        throw error; // Re-throw the error for the caller to handle.
    }
}

module.exports = {fetchData} ;