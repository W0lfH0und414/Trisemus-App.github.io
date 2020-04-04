

const ENCODE_LINK = document.getElementById('enciphered-txt-link');
const DECODE_LINK = document.getElementById('deciphered-txt-link');
const KEY_LINK = document.getElementById('key-txt-link');
const KEYGEN_INPUT = document.getElementById('keygen-input');
const KEYGEN_BTN = document.getElementById('keygen-button');
const DECODE_BTN = document.getElementById('decode-button');
const ENCODE_BTN = document.getElementById('encode-button');
const DOWNLOAD_ENCODED_TXT_BTN = document.getElementById('download-encoded');
const DOWNLOAD_KEY_BTN = document.getElementById('download-key');
const DOWNLOAD_DECODED_TXT_BTN = document.getElementById('download-decoded')
const ENCODE_PROGRESS_BAR = document.getElementById('encode-progress');
const DECODE_PROGRESS_BAR = document.getElementById('decode-progress');
const nonKeyWordChars = [' ', ',', '.', '<', '>', '/', '|', '\\', '\[', '\]',
 '\{', '\}', '!', '@', '\"', '\'', '#', '№', '$', ';', '%', '^', ':', '&', '?',
 '*', '(', ')', '~', '`', '+', '-', '_', '=', '↵', '\n', '\t', '\r'];
const TYPE = 'data:application/octet-stream;base64, ';
let key = [];
let alphabet = [];
let previousFileInput = null;
let keyWord = "";
let plainText = "";
let encipheredText = "";
let keyLen = 0;
let decodeKey = {};
let previousEncTxtInput = "";
let previousKeyInput = "";
let loadedEncipheredText = "";
let decipheredText = "";


const handleKeyGen = (e) => {
    const PLAIN_TEXT_FILE_INPUT = document.getElementById('load-dec');
    let file = PLAIN_TEXT_FILE_INPUT.files[0];
    if (file) {
        let promise = new Promise(function(resolve, reject) {
            let reader = new FileReader();
            if (file !== previousFileInput) {
                alphabet = [];
                plainText = "";
                reader.onload = function() {
                    if (reader.result) {
                        plainText = reader.result;
                        console.log(reader.result);
                        for (let i = 0; i < reader.result.length; i++) {
                            if (alphabet.indexOf(reader.result[i]) === -1) {
                                alphabet.push(reader.result[i]);
                            }
                        }
                        resolve(alphabet);
                    }
                }
                reader.readAsText(file);
            }
            else {
                resolve(alphabet);
            }
        });
        promise.then(result => {
            if(result) {
                console.log(result);
                let nonPunctuationChars = result.map((element) => {
                    if (nonKeyWordChars.indexOf(element) === -1) {
                        return element;
                    }
                })
                if (nonPunctuationChars) {
                    if (plainText.length > 40) {
                        keyLen = Math.round(Math.random()*3) + 5;
                    } 
                    else {
                        keyLen = Math.round(Math.random()*4);
                    }
                    console.log(keyLen);
                    keyWord = "";
                    let keyChar = '';
                    while (keyWord.length < keyLen) {
                        keyChar = nonPunctuationChars[Math.round(Math.random()*nonPunctuationChars.length) - 1];
                        if (keyChar && keyChar !== '↵' && keyWord.indexOf(keyChar) === -1){
                            keyWord += keyChar;
                        }
                    }
                    console.log(keyWord);
                    KEYGEN_INPUT.readOnly = false;
                    KEYGEN_INPUT.value = keyWord;
                    KEYGEN_INPUT.readOnly = true;
                    if (KEYGEN_INPUT.value) {
                        ENCODE_BTN.disabled = false;
                    }
                }
            }
            else {
                KEYGEN_INPUT.readOnly = false;
                KEYGEN_INPUT.value = "";
                KEYGEN_INPUT.readOnly = true;
            }
            previousFileInput = file;
        }, error => alert(error));
    }
    else {return;}
};

const handleFileInput = (e) => {
    if (e.target.id === 'load-dec') {
        console.log(e.target.value);
        e.target.value !== "" ? KEYGEN_BTN.disabled = false : KEYGEN_BTN.disabled = true;
        if (!e.target.value) {
        ENCODE_BTN.disabled = true;
        DOWNLOAD_ENCODED_TXT_BTN.disabled = true;
        DOWNLOAD_KEY_BTN.disabled = true;
        KEYGEN_INPUT.readOnly = false;
        KEYGEN_INPUT.value = "";
        KEYGEN_INPUT.readOnly = true;
        }
    }
    else {
        (document.getElementById('load-en').value !== ""
         && document.getElementById('load-en-key').value !== "") ?
          DECODE_BTN.disabled = false : DECODE_BTN.disabled = true;
        if (!e.target.value) {
            DECODE_BTN.disabled = true;
            DOWNLOAD_DECODED_TXT_BTN.disabled = true;
        }
    }
};

const handleEncode = () => {
    key = [];
    let keyCols = keyWord.length;
    let keyRows = Math.ceil(alphabet.length/keyCols);
    let alphabetIndexer = 0;
    for (let i = 0; i < keyRows; i++) {
        key[i] = [];
        for (let j = 0; j < keyCols; j++) {
            if (i === 0) {
                key[i][j] = keyWord[j];
            }
            else {
                while (keyWord.indexOf(alphabet[alphabetIndexer]) !== -1) {
                    alphabetIndexer++;
                }
                if (alphabetIndexer < alphabet.length) {
                    key[i][j] = alphabet[alphabetIndexer];
                }
                else {
                    key[i][j] = null;
                }
                alphabetIndexer++;
            }
        }
    }
    console.log(key);
    if (key) {
        encipheredText = "";
        for (let i = 0; i < plainText.length; i++) {
            for (let j = 0; j < key.length; j++) {
                if (key[j].indexOf(plainText[i]) !== -1 &&
                 j !== key.length - 1 &&
                  key[j + 1][key[j].indexOf(plainText[i])]) {
                    encipheredText += key[j + 1][key[j].indexOf(plainText[i])];
                }
                else if (key[j].indexOf(plainText[i]) !== -1 && j === key.length - 1) {
                    encipheredText += key[0][key[j].indexOf(plainText[i])];
                }
            }
        }
        console.log(encipheredText);
        console.log(toBinary(encipheredText));
        console.log(fromBinary(encipheredText));
        //let result = TYPE + btoa(encipheredText);
        let converted = toBinary(encipheredText);
        let result = TYPE + btoa(converted);
        let keyObject = JSON.stringify({
            key: key
        });
        let convertedKey = toBinary(keyObject);
        //let keyRef = TYPE + btoa(keyObject);
        let keyRef = TYPE + btoa(convertedKey);
        DOWNLOAD_ENCODED_TXT_BTN.disabled = false;
        DOWNLOAD_KEY_BTN.disabled = false;
        ENCODE_LINK.href = result;
        KEY_LINK.href = keyRef;
    }
};

const handleDecode = () => {
    let encipheredFile = document.getElementById('load-en').files[0];
    let keyFile = document.getElementById('load-en-key').files[0];
    console.log(encipheredFile);
    let textPromise = new Promise((resolve, reject) => {
        let reader = new FileReader();
        if (encipheredFile !== previousEncTxtInput) {
            loadedEncipheredText = "";
            reader.onload = () => {
                if (reader.result) {
                    //let enciphered = atob(reader.result);
                    loadedEncipheredText = fromBinary(reader.result);
                    console.log(reader.result);
                    //resolve(reader.result);
                    resolve(loadedEncipheredText);
                }
            };
            reader.readAsText(encipheredFile);
        }
        else {
            resolve(loadedEncipheredText);
        }
    });
    textPromise.then(result => {
        if (result) {
            console.log(result);
            loadedEncipheredText = result;
            let keyPromise = new Promise((resolve, reject) => {
                let keyReader = new FileReader();
                if (keyFile !== previousKeyInput) {
                    decodeKey = {};
                    keyReader.onload = () => {
                        if(keyReader.result) {
                            console.log(keyReader.result);
                            resolve(fromBinary(keyReader.result));
                        }
                    };
                    keyReader.readAsText(keyFile)
                }
            });
            keyPromise.then(result => {
                if (result) {
                    decodeKey = JSON.parse(result);
                    console.log(decodeKey);
                }
                previousKeyInput = keyFile;
                decipheredText = "";
                console.log(loadedEncipheredText);
                for (let j = 0; j < loadedEncipheredText.length; j++) {
                    for (let i = 0; i < decodeKey.key.length; i++) {
                        if (decodeKey.key[i].indexOf(loadedEncipheredText[j]) !== -1
                         && i !== 0) {
                            decipheredText += decodeKey.key[i - 1][decodeKey.key[i].indexOf(loadedEncipheredText[j])];
                        }
                        else if (decodeKey.key[i].indexOf(loadedEncipheredText[j]) !== -1
                         && i === 0
                          && keyEndingCheck(decodeKey.key) === -1) {
                            decipheredText += decodeKey.key[decodeKey.key.length - 1][decodeKey.key[i].indexOf(loadedEncipheredText[j])];
                        }
                        else if (decodeKey.key[i].indexOf(loadedEncipheredText[j]) !== -1
                         && i === 0 && keyEndingCheck(decodeKey.key) !== -1
                          && decodeKey.key.length > 2) {
                            decipheredText += decodeKey.key[decodeKey.key.length - 2][decodeKey.key[i].indexOf(loadedEncipheredText[j])];
                        }
                    }
                }
                if (decipheredText) {
                    //DECODE_LINK.href = TYPE + btoa(decipheredText);
                    let binaryDecoded = toBinary(decipheredText)
                    DECODE_LINK.href = TYPE + btoa(binaryDecoded);
                    console.log(decipheredText);
                    DOWNLOAD_DECODED_TXT_BTN.disabled = false;
                }
            }, error => alert(error));
        }
        previousEncTxtInput = encipheredFile;
    }, error => alert(error));
}

const keyEndingCheck = (key) => {
    for (let i = 0; i < key[key.length - 1].length; i++) {
        if (key[0].indexOf(key[key.length - 1][i]) !== -1) {
            return key[0].indexOf(key[key.length - 1][i]);
        }
    }
    return -1;
}

const toBinary = (string) => {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = string.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}

const fromBinary = (binary) => {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

KEYGEN_BTN.addEventListener('click', handleKeyGen);
document.getElementById('load-dec').addEventListener('change', handleFileInput);
document.getElementById('load-en').addEventListener('change', handleFileInput);
document.getElementById('load-en-key').addEventListener('change', handleFileInput);
ENCODE_BTN.addEventListener('click', handleEncode);
DECODE_BTN.addEventListener('click', handleDecode);