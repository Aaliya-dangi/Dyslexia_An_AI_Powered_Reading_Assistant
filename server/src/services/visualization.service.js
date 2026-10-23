/**
 * AI Visualization Service (Phase 4 foundation)
 * Generates structured concepts, process flowcharts, and visual outlines from dense text.
 */

export class VisualizationService {
  /**
   * Extract sequential steps or concept relationship nodes from simplified text
   */
  static generateConceptOutline(text) {
    if (!text) return { nodes: [], edges: [], summary: [] };

    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const nodes = [];
    const edges = [];
    const summary = [];

    sentences.forEach((s, idx) => {
      // Step detection cues
      const isSequence = /^(first|second|then|next|after|finally|subsequently|as a result)/i.test(s);
      const title = s.length > 50 ? `${s.substring(0, 47)}...` : s;

      nodes.push({
        id: `node-${idx + 1}`,
        label: title,
        fullText: s,
        stepType: isSequence ? 'process_step' : 'concept_node'
      });

      if (idx > 0) {
        edges.push({
          from: `node-${idx}`,
          to: `node-${idx + 1}`,
          relation: 'leads_to'
        });
      }

      summary.push({
        bulletIndex: idx + 1,
        text: s
      });
    });

    return {
      visualType: 'flowchart_concept_map',
      nodes,
      edges,
      summaryBullets: summary
    };
  }
}
