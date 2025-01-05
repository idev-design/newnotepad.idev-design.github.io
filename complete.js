// DOM Elements
const editor = document.getElementById('editor');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const downloadBtn = document.getElementById('downloadBtn');
const filenameInput = document.getElementById('filename');
const fileFormatSelect = document.getElementById('fileFormat');
const themeSelector = document.getElementById('themeSelector');
const autoSaveNotification = document.getElementById('autoSaveNotification');
const fileInput = document.getElementById('fileInput');
const wordGoalSpan = document.getElementById('wordGoal');

// Initialize editor
document.addEventListener('DOMContentLoaded', () => {
    loadSavedContent();
    updateCounts();
    initAutoSave();
    updateWordGoal();
});

// Text Formatting Functions
document.querySelectorAll('.toolbar button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const command = button.id;
        
        switch(command) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'alignLeft':
                document.execCommand('justifyLeft', false, null);
                break;
            case 'alignCenter':
                document.execCommand('justifyCenter', false, null);
                break;
            case 'alignRight':
                document.execCommand('justifyRight', false, null);
                break;
            case 'bulletList':
                document.execCommand('insertUnorderedList', false, null);
                break;
            case 'numberList':
                document.execCommand('insertOrderedList', false, null);
                break;
            case 'newFile':
                if(confirm('Are you sure you want to create a new file? All unsaved changes will be lost.')) {
                    editor.innerHTML = '';
                    filenameInput.value = '';
                }
                break;
            case 'openFile':
                fileInput.click();
                break;
            case 'insertImage':
                createModal('Insert Image', [
                    { name: 'imageUrl', placeholder: 'Enter image URL', type: 'text' },
                    { name: 'altText', placeholder: 'Enter alt text', type: 'text' }
                ], (values) => {
                    if (values.imageUrl) {
                        const img = `<img src="${values.imageUrl}" alt="${values.altText || ''}" style="max-width: 100%;">`;
                        document.execCommand('insertHTML', false, img);
                    }
                });
                break;
            case 'insertTable':
                createModal('Insert Table', [
                    { name: 'rows', placeholder: 'Number of rows', type: 'number' },
                    { name: 'cols', placeholder: 'Number of columns', type: 'number' }
                ], (values) => {
                    if (values.rows && values.cols) {
                        insertTable(parseInt(values.rows), parseInt(values.cols));
                    }
                });
                break;
            case 'insertLink':
                createModal('Insert Link', [
                    { name: 'url', placeholder: 'Enter URL', type: 'text' },
                    { name: 'text', placeholder: 'Enter link text', type: 'text' }
                ], (values) => {
                    if (values.url) {
                        const link = `<a href="${values.url}" target="_blank">${values.text || values.url}</a>`;
                        document.execCommand('insertHTML', false, link);
                    }
                });
                break;
            case 'findReplace':
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
                break;
            case 'print':
                printDocument();
                break;
            case 'exportPDF':
                exportToPDF();
                break;
        }
    });
});

// Word and Character Count
function updateCounts() {
    const text = editor.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;

    wordCount.textContent = words.length;
    charCount.textContent = characters;
    updateWordGoal();
}

editor.addEventListener('input', updateCounts);

// Auto-save functionality
function initAutoSave() {
    let timeout;
    editor.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            saveContent();
            showAutoSaveNotification();
        }, 1000);
    });
}

function saveContent() {
    localStorage.setItem('editorContent', editor.innerHTML);
    localStorage.setItem('lastSaved', new Date().toISOString());
}

function loadSavedContent() {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }
}

function showAutoSaveNotification() {
    autoSaveNotification.style.display = 'block';
    setTimeout(() => {
        autoSaveNotification.style.display = 'none';
    }, 2000);
}

// Theme Switching
themeSelector.addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    themeSelector.value = savedTheme;
    document.body.className = `theme-${savedTheme}`;
}

// File Operations
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            editor.innerHTML = e.target.result;
            updateCounts();
        };
        reader.readAsText(file);
    }
});

// Download functionality
downloadBtn.addEventListener('click', () => {
    let filename = filenameInput.value.trim();
    const format = fileFormatSelect.value;
    
    if (!filename) {
        filename = `document-${new Date().toISOString().slice(0,10)}`;
    }

    let content = '';
    let mimeType = '';

    switch(format) {
        case 'txt':
            content = editor.innerText;
            mimeType = 'text/plain';
            break;
        case 'html':
            content = editor.innerHTML;
            mimeType = 'text/html';
            break;
        case 'md':
            content = convertToMarkdown(editor.innerHTML);
            mimeType = 'text/markdown';
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
});

// Word Goal Feature
let wordGoal = localStorage.getItem('wordGoal') || 0;

// Word Goal Feature (continued)
document.getElementById('setGoalBtn').addEventListener('click', () => {
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

// Helper Functions
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

function convertToMarkdown(html) {
    let markdown = html;
    // Basic HTML to Markdown conversion
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n');
    markdown = markdown.replace(/<br>/g, '\n');
    markdown = markdown.replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)');
    markdown = markdown.replace(/<img.*?src="(.*?)".*?alt="(.*?)".*?>/g, '![$2]($1)');
    markdown = markdown.replace(/<[^>]*>/g, '');
    return markdown;
}

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

function printDocument() {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        padding: 20px;
                    }
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
}

function exportToPDF() {
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
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                saveContent();
                showAutoSaveNotification();
                break;
            case 'b':
                e.preventDefault();
                document.execCommand('bold', false, null);
                break;
            case 'i':
                e.preventDefault();
                document.execCommand('italic', false, null);
                break;
            case 'k':
                e.preventDefault();
                document.getElementById('insertLink').click();
                break;
            case 'f':
                e.preventDefault();
                document.getElementById('findReplace').click();
                break;
            case 'p':
                e.preventDefault();
                document.getElementById('print').click();
                break;
        }
    }
});




                                                       
