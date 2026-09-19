import { createElement, Fragment, type ReactNode } from 'react';

/**
 * Показывает описание товара с его оформлением: переносами, жирным, списками.
 *
 * Описания приходят из Tilda размеченными. Раньше они выводились как обычная
 * строка, и посетитель видел на странице сам текст «<br />» и «<strong>».
 *
 * Разметку не вставляем через dangerouslySetInnerHTML: содержимое приходит из
 * базы, и один испорченный импорт дал бы выполнение чужого скрипта на странице.
 * Вместо этого разбираем дерево и строим React-элементы только для разрешённых
 * тегов — всё остальное превращается в текст, который React экранирует сам.
 */

/** Теги, которые имеют смысл в описании товара. Атрибуты не переносим вовсе. */
const ALLOWED: Record<string, string> = {
  p: 'p', br: 'br', strong: 'strong', b: 'strong',
  em: 'em', i: 'em', u: 'u', ul: 'ul', ol: 'ol', li: 'li',
};

/** Эти выкидываем вместе с содержимым. */
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);

function toReact(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (DROP.has(tag)) return null;

  const children = Array.from(el.childNodes).map((c, i) => toReact(c, i));
  const mapped = ALLOWED[tag];

  // Незнакомый тег не показываем, но текст внутри сохраняем.
  if (!mapped) return createElement(Fragment, { key }, ...children);
  if (mapped === 'br') return createElement('br', { key });
  return createElement(mapped, { key }, ...children);
}

interface RichTextProps {
  html: string | null | undefined;
  className?: string;
}

export const RichText = ({ html, className }: RichTextProps) => {
  if (!html) return null;

  // Без разметки — обычный абзац, разбирать нечего.
  if (!/<[a-z][^>]*>/i.test(html)) {
    return <p className={className}>{html}</p>;
  }

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return <p className={className}>{html}</p>;

  return (
    <div className={className}>
      {Array.from(root.childNodes).map((n, i) => toReact(n, i))}
    </div>
  );
};
