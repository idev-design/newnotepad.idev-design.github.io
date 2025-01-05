// DOM Elements
const insertImageBtn = document.getElementById('insertImage');
const insertTableBtn = document.getElementById('insertTable');
const insertLinkBtn = document.getElementById('insertLink');
const findReplaceBtn = document.getElementById('findReplace');
const printBtn = document.getElementById('print');
const exportPDFBtn = document.getElementById('exportPDF');
const setGoalBtn = document.getElementById('setGoalBtn');
const wordGoalSpan = document.getElementById('wordGoal');

// Image Insertion
insertImageBtn.addEventListener('click', () => {
    createModal('Insert Image', [
        { name: 'imageUrl', placeholder: 'Enter image URL', type: 'text' },
        { name: 'altText', placeholder: 'Enter alt text', type: 'text' }
    ], (values) => {
        if (values.imageUrl) {
            const img = `<img src="${values.imageUrl}" alt="${values.altText || ''}" style="max-width: 100%;">`;
            document.execCommand('insertHTML', false, img);
        }
    });
});

// Table Insertion
insertTableBtn.addEventListener('click', () => {
    createModal('Insert Table', [
        { name: 'rows', placeholder: 'Number of rows', type: 'number' },
        { name: 'cols', placeholder: 'Number of columns', type: 'number' }
    ], (values) => {
        if (values.rows && values.cols) {
            insertTable(parseInt(values.rows), parseInt(values.cols));
        }
    });
});

// Link Insertion
insertLinkBtn.addEventListener('click', () => {
    createModal('Insert Link', [
        { name: 'url', placeholder: 'Enter URL', type: 'text' },
        { name: 'text', placeholder: 'Enter link text', type: 'text' }
    ], (values) => {
        if (values.url) {
            const link = `<a href="${values.url}" target="_blank">${values.text || values.url}</a>`;
            document.execCommand('insertHTML', false, link);
        }
    });
});

// Find and Replace
findReplaceBtn.addEventListener('click', () => {
    createModal('Find and Replace', [
        { name: 'find', placeholder: 'Text to find', type: 'text' },
        { name: 'replace', placeholder: 'Replace with', type: 'text' }
    ], (values) => {
        if (values.find) {
            const content = editor.innerHTML;
            const newContent = content.replace(
                new RegExp(values.find, 'g'), 
                values.replace || ''
            );
            editor.innerHTML = newContent;
        }
    });
});

// Print Functionality
printBtn.addEventListener('click', () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    img { max-width: 100%; }
                    @media print {
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                ${editor.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
});

// PDF Export (continued)
exportPDFBtn.addEventListener('click', () => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get content and split into lines
        const content = editor.innerText;
        const lines = doc.splitTextToSize(content, 180);
        
        let y = 10;
        lines.forEach(line => {
            if (y > 280) { // Check if we need a new page
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += 7;
        });
        
        doc.save('document.pdf');
    } catch (error) {
        showNotification('Error creating PDF. Please try again.', 'error');
    }
});

// Word Goal Feature
let wordGoal = localStorage.getItem('wordGoal') || 0;

setGoalBtn.addEventListener('click', () => {
    createModal('Set Word Goal', [
        { name: 'goal', placeholder: 'Enter word goal', type: 'number' }
    ], (values) => {
        if (values.goal && !isNaN(values.goal)) {
            wordGoal = parseInt(values.goal);
            localStorage.setItem('wordGoal', wordGoal);
            updateWordGoal();
        }
    });
});

function updateWordGoal() {
    const currentWords = parseInt(wordCount.textContent);
    const percentage = Math.round((currentWords / wordGoal) * 100) || 0;
    wordGoalSpan.textContent = `${currentWords}/${wordGoal} words (${percentage}%)`;
    
    // Update progress color
    if (percentage >= 100) {
        wordGoalSpan.style.color = '#4CAF50';
    } else if (percentage >= 75) {
        wordGoalSpan.style.color = '#2196F3';
    } else {
        wordGoalSpan.style.color = '#666';
    }
}

// Table Helper Function
function insertTable(rows, cols) {
    let table = '<table><tbody>';
    
    // Create header row
    table += '<tr>';
    for (let j = 0; j < cols; j++) {
        table += '<th>Header ' + (j + 1) + '</th>';
    }
    table += '</tr>';
    
    // Create data rows
    for (let i = 0; i < rows - 1; i++) {
        table += '<tr>';
        for (let j = 0; j < cols; j++) {
            table += '<td>Cell</td>';
        }
        table += '</tr>';
    }
    
    table += '</tbody></table>';
    document.execCommand('insertHTML', false, table);
}

// Modal Helper Functions
function createModal(title, fields, callback) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Add title
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    modalContent.appendChild(modalTitle);
    
    // Add fields
    const inputs = {};
    fields.forEach(field => {
        const input = document.createElement('input');
        input.type = field.type || 'text';
        input.placeholder = field.placeholder;
        input.name = field.name;
        inputs[field.name] = input;
        modalContent.appendChild(input);
    });
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'confirm';
    confirmBtn.textContent = 'Confirm';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel';
    cancelBtn.textContent = 'Cancel';
    
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    modalContent.appendChild(buttonContainer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Event listeners
    confirmBtn.addEventListener('click', () => {
        const values = {};
        Object.keys(inputs).forEach(key => {
            values[key] = inputs[key].value;
        });
        callback(values);
        modal.remove();
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update word goal when word count changes
editor.addEventListener('input', updateWordGoal);

// Initialize word goal display
updateWordGoal();

// Add keyboard shortcuts for new features
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'k':
                e.preventDefault();
                insertLinkBtn.click();
                break;
            case 'f':
                e.preventDefault();
                findReplaceBtn.click();
                break;
            case 'p':
                e.preventDefault();
                printBtn.click();
                break;
        }
    }
});








                              
