import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Trash2, Search, Filter } from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

export default function MediaPicker({ isOpen, onClose, onSelect, multi = false, api }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await api().get('/admin/media');
            setMedia(res.data);
        } catch (err) {
            console.error('Error fetching media:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));

        try {
            await api().post('/admin/media', formData);
            fetchMedia();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const toggleSelect = (item) => {
        if (!multi) {
            setSelected([item]);
            return;
        }

        if (selected.find(s => s.file_path === item.file_path)) {
            setSelected(selected.filter(s => s.file_path !== item.file_path));
        } else {
            setSelected([...selected, item]);
        }
    };

    const confirmSelection = () => {
        if (multi) {
            onSelect(selected.map(s => ({
                url: s.url,
                alt: s.alt || s.name?.split('.')[0] || '',
                title: s.title || '',
                caption: s.caption || ''
            })));
        } else {
            onSelect({
                url: selected[0].url,
                alt: selected[0].alt || selected[0].name?.split('.')[0] || '',
                title: selected[0].title || '',
                caption: selected[0].caption || ''
            });
        }
        onClose();
    };

    const deleteMedia = async (path) => {
        if (!window.confirm('Supprimer définitivement ce fichier ?')) return;
        try {
            await api().delete('/admin/media', { data: { path } });
            fetchMedia();
            setSelected(selected.filter(s => s.file_path !== path));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    if (!isOpen) return null;

    const filteredMedia = media.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-primary/10 flex items-center justify-between bg-primary/2">
                    <div>
                        <h3 className="display-font text-2xl text-primary italic">Médiathèque</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-1">Gérez et sélectionnez vos médias</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary/40 hover:text-primary">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-white border-b border-primary/5 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un média..." 
                            className="w-full pl-10 pr-4 py-2 bg-primary/2 border border-primary/10 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-secondary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-90 transition-opacity">
                            <Upload size={16} /> 
                            {uploading ? 'Envoi...' : 'Importer'}
                            <input type="file" multiple className="hidden" onChange={handleUpload} accept="image/*,application/pdf" />
                        </label>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-primary/2">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-primary/40 gap-4">
                            <Filter size={48} strokeWidth={1} />
                            <p className="text-sm italic">Aucun média trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredMedia.map((item) => (
                                <div 
                                    key={item.file_path}
                                    onClick={() => toggleSelect(item)}
                                    className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                                        selected.find(s => s.file_path === item.file_path) 
                                            ? 'border-secondary ring-4 ring-secondary/10' 
                                            : 'border-white hover:border-primary/20 shadow-sm'
                                    }`}
                                >
                                    {item.type === 'image' ? (
                                        <img src={getAssetUrl(item.url)} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <div className="w-full h-full bg-primary/5 flex items-center justify-center flex-col p-4 text-center">
                                            <span className="text-xs font-bold text-primary">{item.name.split('.').pop().toUpperCase()}</span>
                                            <span className="text-[8px] text-primary/40 truncate w-full mt-1">{item.name}</span>
                                        </div>
                                    )}
                                    
                                    {/* Selected Overlay */}
                                    {selected.find(s => s.file_path === item.file_path) && (
                                        <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
                                            <div className="bg-secondary text-white rounded-full p-1 shadow-lg scale-110">
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action buttons on hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteMedia(item.file_path);
                                            }}
                                            className="pointer-events-auto p-2 bg-error text-white rounded-lg hover:scale-110 transition-transform shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-primary/10 flex items-center justify-between bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
                        {selected.length} élément{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-outline hover:bg-surface-container-high transition-colors">
                            Annuler
                        </button>
                        <button 
                            disabled={selected.length === 0}
                            onClick={confirmSelection}
                            className="px-8 py-2.5 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
                        >
                            Valider la sélection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
