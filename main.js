// Neo Code Generator - Enhanced JavaScript
'use strict';

// DOM elements
const numeroSenha = document.querySelector('.parametro-senha__texto');
const botoes = document.querySelectorAll('.parametro-senha__botao');
const campoSenha = document.querySelector('#campo-senha');
const checkbox = document.querySelectorAll('.checkbox');
const forcaSenha = document.querySelector('.forca');
const copyButton = document.querySelector('#copy-button');
const copyNotification = document.querySelector('#copy-notification');

// Password configuration
let tamanhoSenha = 12;
numeroSenha.textContent = tamanhoSenha;

// Character sets
const characterSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@%*?$&+-#'
};

// Event listeners
botoes[0].addEventListener('click', diminuiTamanho);
botoes[1].addEventListener('click', aumentaTamanho);

checkbox.forEach(cb => {
    cb.addEventListener('change', geraSenha);
});

copyButton.addEventListener('click', copiarSenha);

// Initialize password generation
geraSenha();

function diminuiTamanho() {
    if (tamanhoSenha > 1) {
        tamanhoSenha--;
        numeroSenha.textContent = tamanhoSenha;
        geraSenha();
    }
}

function aumentaTamanho() {
    if (tamanhoSenha < 128) {
        tamanhoSenha++;
        numeroSenha.textContent = tamanhoSenha;
        geraSenha();
    }
}

function geraSenha() {
    let alfabeto = '';
    
    // Build character set based on selected options
    if (checkbox[0].checked) alfabeto += characterSets.uppercase;
    if (checkbox[1].checked) alfabeto += characterSets.lowercase;
    if (checkbox[2].checked) alfabeto += characterSets.numbers;
    if (checkbox[3].checked) alfabeto += characterSets.symbols;
    
    // Ensure at least one character type is selected
    if (alfabeto === '') {
        checkbox[0].checked = true;
        alfabeto = characterSets.uppercase;
    }
    
    // Generate password using crypto API for better randomness
    let senha = '';
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(tamanhoSenha);
        window.crypto.getRandomValues(array);
        for (let i = 0; i < tamanhoSenha; i++) {
            senha += alfabeto[array[i] % alfabeto.length];
        }
    } else {
        // Fallback to Math.random
        for (let i = 0; i < tamanhoSenha; i++) {
            const randomIndex = Math.floor(Math.random() * alfabeto.length);
            senha += alfabeto[randomIndex];
        }
    }
    
    campoSenha.value = senha;
    classificaSenha(alfabeto.length);
}

function classificaSenha(tamanhoAlfabeto) {
    const entropia = tamanhoSenha * Math.log2(tamanhoAlfabeto);
    
    // Update strength indicator
    forcaSenha.classList.remove('fraca', 'media', 'forte');
    
    let strengthClass, strengthText;
    if (entropia >= 70) {
        strengthClass = 'forte';
        strengthText = 'Strong';
    } else if (entropia >= 50) {
        strengthClass = 'media';
        strengthText = 'Medium';
    } else {
        strengthClass = 'fraca';
        strengthText = 'Weak';
    }
    
    forcaSenha.classList.add(strengthClass);
    
    // Update entropy display with more accurate calculation
    const valorEntropia = document.querySelector('.entropia');
    const timeToBreak = calculateBreakTime(entropia);
    valorEntropia.textContent = `Entropy: ${Math.round(entropia)} bits. ${timeToBreak}`;
    
    // Update aria-label for screen readers
    const strengthIndicator = document.querySelector('.barra');
    strengthIndicator.setAttribute('aria-label', `Password strength: ${strengthText}`);
}

function calculateBreakTime(entropia) {
    const attemptsPerSecond = 1e12; // 1 trillion attempts per second (generous estimate)
    const secondsToBreak = Math.pow(2, entropia - 1) / attemptsPerSecond;
    
    if (secondsToBreak < 60) {
        return "Can be broken in seconds.";
    } else if (secondsToBreak < 3600) {
        return `Would take ~${Math.round(secondsToBreak / 60)} minutes to break.`;
    } else if (secondsToBreak < 86400) {
        return `Would take ~${Math.round(secondsToBreak / 3600)} hours to break.`;
    } else if (secondsToBreak < 31536000) {
        return `Would take ~${Math.round(secondsToBreak / 86400)} days to break.`;
    } else if (secondsToBreak < 31536000000) {
        return `Would take ~${Math.round(secondsToBreak / 31536000)} years to break.`;
    } else {
        return "Would take millions of years to break.";
    }
}

async function copiarSenha() {
    try {
        await navigator.clipboard.writeText(campoSenha.value);
        showCopyNotification();
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Update button text temporarily
        const originalContent = copyButton.innerHTML;
        copyButton.innerHTML = '<span>✓</span>';
        copyButton.style.background = 'var(--verde-claro)';
        
        setTimeout(() => {
            copyButton.innerHTML = originalContent;
            copyButton.style.background = '';
        }, 1000);
        
    } catch (err) {
        console.warn('Could not copy password: ', err);
        // Fallback for older browsers
        fallbackCopyTextToClipboard(campoSenha.value);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopyNotification() {
    copyNotification.classList.add('show');
    setTimeout(() => {
        copyNotification.classList.remove('show');
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + G to generate new password
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        geraSenha();
    }
    
    // Ctrl/Cmd + C when password field is focused to copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === campoSenha) {
        e.preventDefault();
        copiarSenha();
    }
});

// Auto-generate new password when page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        geraSenha();
    }
});
