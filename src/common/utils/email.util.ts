export function generateCompanyEmail(
  firstName: string,
  lastName: string,
  domain = 'company.com',
): string {
  return `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z.]/g, '') + `@${domain}`;
}
