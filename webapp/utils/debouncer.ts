export default function debouncer(fnCallBack: Function, delay: number) {
    let timeOut: number;
    return function (...args: any) {
        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
            fnCallBack(...args);
        }, delay);
    }
}