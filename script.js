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

        const lineMap = {};

        content.items.forEach(item => {
            const y = Math.round(item.transform[5]);

            if (!lineMap[y]) {
                lineMap[y] = [];
            }

            lineMap[y].push(item.str);
        });

        const lines = Object.keys(lineMap)
            .sort((a, b) => b - a)
            .map(y => lineMap[y].join(" "));

        fullText += lines.join("\n") + "\n";
    }

    const lines = fullText.split("\n");

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);

        if (parts.length < 4) return;
        if (!/^[А-ЯІЇЄҐ]/.test(parts[0])) return;
        if (line.includes("Факультет") || line.includes("П.І.Б")) return;

        const name = parts.slice(0, 3).join(" ");

        const score = parts.find(p => /^\d+(\.\d+)?$/.test(p));

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${name}</td>
        <td>${score || "не розраховується"}</td>
    `;

        tableBody.appendChild(row);
    });
});