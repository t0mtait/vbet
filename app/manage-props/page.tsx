'use client';

import React, { useState, useEffect } from 'react';

interface Prop {
  id: number;
  category: string;
  name: string;
  return: number;
  status: 'active' | 'inactive';
}

export default function ManagePropsPage() {
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    return: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    category: '',
    name: '',
    return: '',
  });

  useEffect(() => {
    fetchProps();
  }, []);

  async function fetchProps() {
    try {
      const response = await fetch('/api/props');
      const data = await response.json();
      setProps(data);
    } catch (error) {
      console.error('Failed to fetch props:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProp(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/props', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          name: formData.name,
          return: parseFloat(formData.return),
          status: 'active',
        }),
      });
      
      if (response.ok) {
        setFormData({ category: '', name: '', return: '' });
        fetchProps();
      }
    } catch (error) {
      console.error('Failed to create prop:', error);
    }
  }

  async function handleDeleteProp(id: number) {
    try {
      await fetch('/api/props', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchProps();
    } catch (error) {
      console.error('Failed to delete prop:', error);
    }
  }

  function startEditingProp(prop: Prop) {
    setEditingId(prop.id);
    setEditFormData({
      category: prop.category,
      name: prop.name,
      return: prop.return.toString(),
    });
  }

  async function handleEditProp(e: React.FormEvent) {
    e.preventDefault();
    if (editingId === null) return;

    try {
      const response = await fetch('/api/props', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          category: editFormData.category,
          name: editFormData.name,
          return: parseFloat(editFormData.return),
          status: 'active',
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditFormData({ category: '', name: '', return: '' });
        fetchProps();
      }
    } catch (error) {
      console.error('Failed to edit prop:', error);
    }
  }

  function cancelEditingProp() {
    setEditingId(null);
    setEditFormData({ category: '', name: '', return: '' });
  }

  function toggleCategory(category: string) {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }

  const categories = ['CJ', 'Tom', 'Stef', 'Chris', 'Other Player', 'Match'];
  const propsByCategory = categories.map(cat => ({
    category: cat,
    props: props.filter(p => p.category === cat)
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2">Manage Props</h1>
        </div>

        {/* Create New Prop Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 border border-slate-700/50 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Create New Prop</h2>
          <form className="space-y-6" onSubmit={handleCreateProp}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-white font-bold text-lg mb-3">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-700/50 text-white rounded-xl px-5 py-3 border border-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                >
                  <option value="">Select a category</option>
                  <option value="CJ">CJ</option>
                  <option value="Tom">Tom</option>
                  <option value="Stef">Stef</option>
                  <option value="Chris">Chris</option>
                  <option value="Other Player">Other Player</option>
                  <option value="Match">Match</option>
                </select>
              </div>
              <div>
                <label className="block text-white font-bold text-lg mb-3">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Prediction 1"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-700/50 text-white rounded-xl px-5 py-3 border border-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-white font-bold text-lg mb-3">
                  Return (x)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={formData.return}
                  onChange={(e) => setFormData({...formData, return: e.target.value})}
                  className="w-full bg-slate-700/50 text-white rounded-xl px-5 py-3 border border-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder-slate-400"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              ➕ Create Prop
            </button>
          </form>
        </div>

        {/* Props List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">All Props</h2>
          {loading ? (
            <div className="text-slate-300 text-center py-8">Loading props...</div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-slate-700/50 border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-sm font-bold text-white w-1/6">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white w-2/5">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white w-1/6">Return</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white w-1/6">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-white w-1/6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propsByCategory.map(({ category, props: categoryProps }) => (
                      <React.Fragment key={category}>
                        {/* Category Header Row */}
                        <tr className="bg-slate-700/50 hover:bg-slate-700/70 transition-colors cursor-pointer border-b border-slate-700">
                          <td colSpan={5} className="px-6 py-4">
                            <button
                              onClick={() => toggleCategory(category)}
                              className="flex items-center gap-3 w-full text-left font-bold text-lg text-red-400 hover:text-red-300 transition-colors"
                            >
                              <span className="text-xl">
                                {expandedCategories.has(category) ? '▼' : '▶'}
                              </span>
                              <span>{category}</span>
                              <span className="text-sm text-slate-400 font-normal ml-auto">
                                ({categoryProps.length} prop{categoryProps.length !== 1 ? 's' : ''})
                              </span>
                            </button>
                          </td>
                        </tr>
                        
                        {/* Props in this category */}
                        {expandedCategories.has(category) && categoryProps.map((prop) => (
                          <tr key={prop.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                            {editingId === prop.id ? (
                              // Edit form row
                              <td colSpan={5} className="px-6 py-4">
                                <form className="flex gap-4 items-end" onSubmit={handleEditProp}>
                                  <div className="flex-1">
                                    <label className="block text-white font-bold text-xs mb-1">Category</label>
                                    <select
                                      value={editFormData.category}
                                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                                      className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-red-500 focus:outline-none text-sm"
                                    >
                                      <option value="CJ">CJ</option>
                                      <option value="Tom">Tom</option>
                                      <option value="Stef">Stef</option>
                                      <option value="Chris">Chris</option>
                                      <option value="Other Player">Other Player</option>
                                      <option value="Match">Match</option>
                                    </select>
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-white font-bold text-xs mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={editFormData.name}
                                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                      className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-red-500 focus:outline-none text-sm"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-white font-bold text-xs mb-1">Return (x)</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={editFormData.return}
                                      onChange={(e) => setEditFormData({...editFormData, return: e.target.value})}
                                      className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-red-500 focus:outline-none text-sm"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditingProp}
                                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </td>
                            ) : (
                              // Display mode
                              <>
                                <td className="px-6 py-4 text-sm text-slate-300 w-1/6">{prop.category}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-white w-2/5">{prop.name}</td>
                                <td className="px-6 py-4 text-sm font-bold text-red-400 w-1/6">{prop.return}x</td>
                                <td className="px-6 py-4 text-sm w-1/6">
                                  <StatusPropBadge status={prop.status} />
                                </td>
                                <td className="px-6 py-4 text-sm text-right w-1/6">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => startEditingProp(prop)}
                                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProp(prop.id)}
                                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatusPropBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', emoji: '✅' },
    inactive: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', emoji: '❌' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
      <span>{config.emoji}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
