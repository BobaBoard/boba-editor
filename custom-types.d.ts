declare module "*.png";
declare module "*.svg";
declare module "*.html";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
