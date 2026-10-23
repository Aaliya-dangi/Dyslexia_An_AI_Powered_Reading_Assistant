import React, { useEffect, useState } from 'react';
import { Network, ArrowRight, CheckCircle, Sparkles, X, ListOrdered } from 'lucide-react';
import { getDocumentVisualization } from '../services/api';

export default function VisualizationModal({ documentId, simplifiedText, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadVisualization() {
      try {
        if (documentId) {
          const res = await getDocumentVisualization(documentId);
          setData(res);
        } else {
          // Fallback from raw text
          const sentences = simplifiedText.split(/(?<=[.?!])\s+/).filter(Boolean);
          setData({
            nodes: sentences.map((s, i) => ({
              id: `node-${i + 1}`,
              label: s.length > 60 ? `${s.substring(0, 57)}...` : s,
              fullText: s,
              stepType: 'concept_node'
            })),
            summaryBullets: sentences.map((s, i) => ({ bulletIndex: i + 1, text: s }))
          });
        }
      } catch (e) {
        console.warn('Visualization fallback:', e);
      } finally {
        setLoading(false);
      }
    }
    loadVisualization();
  }, [documentId, simplifiedText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
           style={{
             backgroundColor: 'var(--card-bg)',
             borderColor: 'var(--border-color)',
             color: 'var(--text-main)'
           }}>
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between"
             style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base sm:text-lg">Visual Learning & Concept Map</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border-color)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="text-center py-10 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto animate-spin text-indigo-600" />
              <p className="text-sm font-semibold">Generating visual flowchart breakdown...</p>
            </div>
          ) : (
            <>
              {/* Sequential Step Nodes / Flowchart */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 mb-3 flex items-center space-x-1.5">
                  <ListOrdered className="w-4 h-4" />
                  <span>Sequential Concept Flow</span>
                </h4>

                <div className="space-y-3">
                  {data?.nodes?.map((node, index) => (
                    <div key={node.id} className="relative">
                      <div className="p-4 rounded-xl border shadow-xs transition-transform hover:-translate-y-0.5"
                           style={{
                             backgroundColor: 'var(--bg-main)',
                             borderColor: 'var(--border-color)'
                           }}>
                        <div className="flex items-start space-x-3">
                          <span className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5"
                                style={{ backgroundColor: 'var(--accent-color)', color: '#FFFFFF' }}>
                            {index + 1}
                          </span>
                          <div className="text-sm sm:text-base font-medium leading-relaxed">
                            {node.fullText || node.label}
                          </div>
                        </div>
                      </div>

                      {index < (data.nodes.length - 1) && (
                        <div className="flex justify-center my-1">
                          <ArrowRight className="w-4 h-4 rotate-90 text-indigo-500 opacity-60" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
