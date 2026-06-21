import { View, Text } from 'react-native';
import { Colors } from '../lib/theme';

/**
 * AiMarkdown — a tiny, dependency-free Markdown renderer for React Native.
 *
 * The FITNEX Coach system prompt produces a predictable subset of Markdown:
 * headings (#, ##, ###), bullet lists (-, *), numbered lists (1.), bold (**…**),
 * and blockquotes (>). This renders exactly that subset with theme colors, so
 * we avoid pulling in a heavyweight markdown dependency on mobile.
 *
 * Anything it doesn't specifically recognize is rendered as a normal paragraph,
 * so unexpected formatting still shows up as readable text (never broken).
 */

/** Render a single line's inline **bold** segments. */
function InlineText({ text, baseStyle }) {
  // Split on **bold** while keeping the delimiters' content.
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontWeight: '700', color: Colors.primary }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export default function AiMarkdown({ content }) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');

  const blocks = [];
  lines.forEach((raw, idx) => {
    const line = raw.replace(/\s+$/, '');
    const key = `l-${idx}`;

    if (line.trim() === '') {
      blocks.push(<View key={key} style={{ height: 6 }} />);
      return;
    }

    // Headings
    if (/^###\s+/.test(line)) {
      blocks.push(
        <InlineText
          key={key}
          text={line.replace(/^###\s+/, '')}
          baseStyle={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginTop: 6, marginBottom: 2 }}
        />
      );
      return;
    }
    if (/^##\s+/.test(line)) {
      blocks.push(
        <InlineText
          key={key}
          text={line.replace(/^##\s+/, '')}
          baseStyle={{ fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 8, marginBottom: 3 }}
        />
      );
      return;
    }
    if (/^#\s+/.test(line)) {
      blocks.push(
        <InlineText
          key={key}
          text={line.replace(/^#\s+/, '')}
          baseStyle={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 8, marginBottom: 4 }}
        />
      );
      return;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      blocks.push(
        <View key={key} style={{ borderLeftWidth: 2, borderLeftColor: Colors.primary300, paddingLeft: 10, marginVertical: 3 }}>
          <InlineText text={line.replace(/^>\s?/, '')} baseStyle={{ fontSize: 14, fontStyle: 'italic', color: Colors.textMuted }} />
        </View>
      );
      return;
    }

    // Bullet list item
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      blocks.push(
        <View key={key} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 4 }}>
          <Text style={{ color: Colors.primary, marginRight: 8, fontSize: 14, lineHeight: 20 }}>•</Text>
          <View style={{ flex: 1 }}>
            <InlineText text={bullet[1]} baseStyle={{ fontSize: 14, lineHeight: 20, color: Colors.textBody }} />
          </View>
        </View>
      );
      return;
    }

    // Numbered list item
    const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numbered) {
      blocks.push(
        <View key={key} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 4 }}>
          <Text style={{ color: Colors.primary, marginRight: 8, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>
            {numbered[1]}.
          </Text>
          <View style={{ flex: 1 }}>
            <InlineText text={numbered[2]} baseStyle={{ fontSize: 14, lineHeight: 20, color: Colors.textBody }} />
          </View>
        </View>
      );
      return;
    }

    // Paragraph
    blocks.push(
      <InlineText key={key} text={line} baseStyle={{ fontSize: 14, lineHeight: 20, color: Colors.textBody, marginBottom: 3 }} />
    );
  });

  return <View>{blocks}</View>;
}
