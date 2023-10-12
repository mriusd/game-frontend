export const getIs = (string: string) => {
    return (...args: string[]) => {
        return args.every(value => string.toLowerCase().includes(value.toLowerCase()))
    }
}