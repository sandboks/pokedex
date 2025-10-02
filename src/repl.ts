export function cleanInput(input: string): string[] {
    input = input.trim().toLowerCase();
    return input.split(/\s+/);
}