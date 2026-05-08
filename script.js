const input = document.getElementById("fileInput");
const tableBody = document.getElementById("tableBody");

input.addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    tableBody.innerHTML = "";

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        let linesMap = {};

        content.items.forEach(item => {
            const y = Math.round(item.transform[5]);
            if (!linesMap[y]) {
                linesMap[y] = [];
            }
            linesMap[y].push(item.str);
        });

        const sortedLines = Object.keys(linesMap)
            .sort((a, b) => b - a)
            .map(y => linesMap[y].join(" "));
        fullText += sortedLines.join("\n") + "\n";
    }

    console.log(fullText);

    const lines = fullText.split("\n");

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);

        if (parts.length >= 2) {
            const name = parts[0];
            const score = parts[1];

            if (!isNaN(score)) {
                const row = document.createElement("tr");
                const tdName = document.createElement("td");
                tdName.textContent = name;
                const tdScore = document.createElement("td");
                tdScore.textContent = score;
                row.appendChild(tdName);
                row.appendChild(tdScore);
                tableBody.appendChild(row);
            }
        }
    });
});