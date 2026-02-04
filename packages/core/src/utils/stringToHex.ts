export default function stringToHex(str: string) {
  if (str === "") return "";
  const hexCharCode: string[] = [];
  hexCharCode.push("0x");
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    hexCharCode.push(str.charCodeAt(i).toString(16));
  }
  return hexCharCode.join("");
}
