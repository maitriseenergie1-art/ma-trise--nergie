// During the build-time prerender there is no document. Seo pushes the head
// description here and scripts/prerender.mjs reads it back after render.
export const ssrHead = {
  current: null,
};

export function collectHead(descriptor) {
  ssrHead.current = descriptor;
}
