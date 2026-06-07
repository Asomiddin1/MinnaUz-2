declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// next-intl type safety
type Messages = typeof import("./messages/uz.json");
declare interface IntlMessages extends Messages {}
