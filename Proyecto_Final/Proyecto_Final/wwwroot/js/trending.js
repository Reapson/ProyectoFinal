document.addEventListener("DOMContentLoaded", () => {

    loadTrending();

    const refreshButton = document.getElementById("refreshButton");

    refreshButton.addEventListener("click", loadTrending);
});


async function loadTrending() {

    const keywordsContainer =
        document.getElementById("keywordsContainer");

    const sentimentContainer =
        document.getElementById("sentimentContainer");

    const totalItems =
        document.getElementById("totalItems");

    const totalKeywords =
        document.getElementById("totalKeywords");

    const status =
        document.getElementById("status");

    try {

        status.textContent = "Cargando...";

        const response = await fetch("/api/trending");

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        totalItems.textContent =
            data.totalItemsAnalyzed ?? 0;

        totalKeywords.textContent =
            data.topKeywords?.length ?? 0;

        status.textContent = "Conectado";

        renderKeywords(
            data.topKeywords ?? [],
            keywordsContainer
        );

        renderSentiment(
            data.sentimentBreakdown ?? {},
            sentimentContainer
        );

    } catch (error) {

        console.error("Error al cargar tendencias:", error);

        status.textContent = "Error";

        keywordsContainer.innerHTML = `
            <p class="error">
                No se pudieron cargar las tendencias.
            </p>
        `;

        sentimentContainer.innerHTML = `
            <p class="error">
                No se pudo cargar el análisis de sentimiento.
            </p>
        `;
    }
}


function renderKeywords(keywords, container) {

    if (keywords.length === 0) {

        container.innerHTML = `
            <p class="loading">
                No hay palabras clave disponibles.
            </p>
        `;

        return;
    }

    const maxOccurrences = Math.max(
        ...keywords.map(item => item.occurrences)
    );

    container.innerHTML = keywords.map(item => {

        const percentage =
            maxOccurrences > 0
                ? (item.occurrences / maxOccurrences) * 100
                : 0;

        return `
            <div class="keyword">

                <div class="keyword-header">
                    <span>
                        ${escapeHtml(item.keyword)}
                    </span>

                    <strong>
                        ${item.occurrences}
                    </strong>
                </div>

                <div class="bar-container">
                    <div
                        class="bar"
                        style="width: ${percentage}%">
                    </div>
                </div>

            </div>
        `;

    }).join("");
}


function renderSentiment(sentiments, container) {

    const entries = Object.entries(sentiments);

    if (entries.length === 0) {

        container.innerHTML = `
            <p class="loading">
                No hay información de sentimiento disponible.
            </p>
        `;

        return;
    }

    const total = entries.reduce(
        (sum, [, value]) => sum + value,
        0
    );

    container.innerHTML = entries.map(
        ([sentiment, count]) => {

            const percentage =
                total > 0
                    ? (count / total) * 100
                    : 0;

            return `
                <div class="sentiment">

                    <div class="sentiment-header">

                        <span>
                            ${getSentimentLabel(sentiment)}
                        </span>

                        <strong>
                            ${count}
                        </strong>

                    </div>

                    <div class="sentiment-bar">

                        <div
                            class="sentiment-fill"
                            style="width: ${percentage}%">
                        </div>

                    </div>

                </div>
            `;
        }
    ).join("");
}


function getSentimentLabel(sentiment) {

    switch (sentiment.toLowerCase()) {

        case "positivo":
            return "😊 Positivo";

        case "negativo":
            return "😟 Negativo";

        case "neutral":
            return "😐 Neutral";

        default:
            return sentiment;
    }
}


function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}