export interface EnumOption {
    label: string;
    value: string;
}

export function numericEnumToOptions(enumObj: object): EnumOption[] {
    return Object.keys(enumObj)
        .filter(key => isNaN(Number(key))) // keep only the string keys
        .map(key => ({
            label: toLabel(key),
            value: (enumObj as any)[key]
        }));
}

export function enumToOptions(enumObj: object): EnumOption[] {
    return Object.values(enumObj).map(value => ({
        label: toLabel(value as string),
        value: value as string
    }));
}

function toLabel(value: string): string {
    return value
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
