/**
 * Simple Base64-based obfuscation to prevent casual viewing of sensitive data in LocalStorage.
 * Note: This is NOT strong encryption, but a deterrent for shared devices.
 */
const obfuscate = (str: string) => btoa(encodeURIComponent(str));
const deobfuscate = (str: string) => decodeURIComponent(atob(str));

export const storage = {
    set: (key: string, value: any) => {
        const json = JSON.stringify(value);
        localStorage.setItem(key, obfuscate(json));
    },
    get: (key: string) => {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
            return JSON.parse(deobfuscate(item));
        } catch (e) {
            console.error("Storage decryption error:", e);
            return null;
        }
    },
    remove: (key: string) => localStorage.removeItem(key),
};
