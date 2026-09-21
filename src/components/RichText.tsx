import { createElement, Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Показывает размеченный текст из базы: описание товара или статью блога.
 *
 * Описания приходят из Tilda размеченными. Раньше они выводились как обычная
 * строка, и посетитель видел на странице сам текст «<br />» и «<strong>».
 *
 * Разметку не вставляем через dangerouslySetInnerHTML: содержимое приходит из
 * базы, и один испорченный импорт дал бы выполнение чужого скрипта на странице.
 * Вместо этого разбираем дерево и строим React-элементы только для разрешённых
 * тегов — всё остальное превращается в текст, который React экранирует сам.
 */

/**
 * Теги, которые имеют смысл в описании товара и в статье блога.
 * h2/h3/blockquote нужны статьям: без них заголовки разделов схлопнулись бы
 * в сплошной текст. Заголовка первого уровня здесь нет намеренно — его
 * страница выводит сама из названия статьи.
 */
const ALLOWED: Record<string, string> = {
  p: 'p', br: 'br', strong: 'strong', b: 'strong',
  em: 'em', i: 'em', u: 'u', ul: 'ul', ol: 'ol', li: 'li',
  h2: 'h2', h3: 'h3', h4: 'h4', blockquote: 'blockquote', a: 'a',
};

/** Эти выкидываем вместе с содержимым. */
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);

/**
 * Единственный атрибут, который переносим, — адрес ссылки, и только если он
 * ведёт внутрь сайта или на http(s). Схемы вроде javascript: и data: не
 * пропускаем: ссылка с таким адресом — это тот же исполняемый чужой код,
 * от которого мы ушли, отказавшись от прямой вставки разметки.
 */
function safeHref(raw: string | null): string | null {
  if (!raw) return null;
  const href = raw.trim();
  if (href.startsWith('/') || href.startsWith('#')) return href;
  if (/^https?:\/\//i.test(href)) return href;
  return null;
}

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

  if (mapped === 'a') {
    const href = safeHref(el.getAttribute('href'));
    // Ссылка с небезопасным адресом остаётся текстом, а не исчезает.
    if (!href) return createElement(Fragment, { key }, ...children);
    // Внутренние ссылки — через Link, иначе переход по ссылке внутри статьи
    // перезагружал бы всё приложение целиком вместо смены маршрута.
    if (href.startsWith('/')) {
      return createElement(Link, { key, to: href }, ...children);
    }
    return createElement(
      'a',
      /^https?:\/\//i.test(href)
        ? { key, href, target: '_blank', rel: 'noopener noreferrer' }
        : { key, href },
      ...children,
    );
  }

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
