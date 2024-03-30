function convertUnixToDate(date: number): string {
  let dateObj = new Date(date * 1000).toLocaleString();
  return dateObj;
}
export default convertUnixToDate