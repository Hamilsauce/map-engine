export const template = (name) => {
  return document.querySelector(`#${name}-template`)
    .content.firstElementChild
    .cloneNode(true);
};
