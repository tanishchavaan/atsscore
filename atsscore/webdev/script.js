async function analyzeResume() {
    const fileInput = document.getElementById('resumeFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a PDF file!');
        return;
    }

    if (file.type !== 'application/pdf') {
        alert('Only PDF files allowed.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async function() {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let textContent = '';

        // Read and display the first page in canvas
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.getElementById('pdfCanvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Extract all pages text
        for (let i = 1; i <= pdf.numPages; i++) {
            const pg = await pdf.getPage(i);
            const content = await pg.getTextContent();
            const textItems = content.items.map(item => item.str);
            textContent += textItems.join(' ');
        }

        evaluateResume(textContent);
    };
    fileReader.readAsArrayBuffer(file);
}

function evaluateResume(text) {
    let score = 0;
    const suggestions = [];
    const textLower = text.toLowerCase();

    const importantSections = ['experience', 'education', 'skills', 'projects', 'certifications', 'achievements'];

    importantSections.forEach(section => {
        if (textLower.includes(section)) {
            score += 15;
        } else {
            suggestions.push(`⚡ Add a <b>${section}</b> section!`);
        }
    });

    if (!textLower.includes('linkedin')) {
        suggestions.push('⚡ Add your <b>LinkedIn</b> profile link. <a href="https://linkedin.com/" target="_blank">Learn how</a>');
    }

    if (!textLower.includes('github')) {
        suggestions.push('⚡ Showcase your <b>GitHub</b> portfolio. <a href="https://github.com/" target="_blank">GitHub Setup</a>');
    }

    if (!textLower.includes('email') && !textLower.includes('@')) {
        suggestions.push('⚡ Provide a professional <b>Email</b> address.');
    }

    if (text.split(' ').length > 1000) {
        suggestions.push('⚡ Resume is too lengthy, keep it under 2 pages.');
    }

    if (text.length < 300) {
        suggestions.push('⚡ Resume is too short. Add more internships, projects, certifications.');
    }

    score = Math.min(score, 100);

    // Display results
    document.getElementById('score').innerText = score;
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';

    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = suggestion;
        suggestionsList.appendChild(li);
    });

    document.getElementById('result').classList.remove('hidden');
}
