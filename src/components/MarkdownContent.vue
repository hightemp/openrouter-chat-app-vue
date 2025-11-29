<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import 'highlight.js/styles/github-dark.css';

const props = defineProps<{
  content: string;
}>();

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const renderedContent = computed(() => {
  const rawHtml = md.render(props.content);
  return DOMPurify.sanitize(rawHtml);
});
</script>

<template>
  <div class="markdown-body" v-html="renderedContent"></div>
</template>

<style>
.markdown-body {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.markdown-body pre {
  background-color: var(--bg-secondary);
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  border: 1px solid var(--border-color);
}

.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875em;
  background-color: var(--bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-body p {
  margin-bottom: 1em;
}

.markdown-body ul, .markdown-body ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.markdown-body ul {
  list-style-type: disc;
}

.markdown-body ol {
  list-style-type: decimal;
}

.markdown-body a {
  color: var(--accent-color);
  text-decoration: underline;
}

.markdown-body blockquote {
  border-left: 4px solid var(--border-color);
  padding-left: 1em;
  color: var(--text-tertiary);
  margin-bottom: 1em;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 { font-size: 2em; }
.markdown-body h2 { font-size: 1.5em; }
.markdown-body h3 { font-size: 1.25em; }
</style>