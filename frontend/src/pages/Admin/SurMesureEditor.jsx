import { Trash2, Plus, Image as ImageIcon, Upload } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

// Helper to get full image URL
const getImgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage')) return `${API_BASE}${path}`;
    return path;
};

export default function SurMesureEditor({ data, setData }) {

    const updateField = (field, val) => setData({ ...data, [field]: val });

    const addListItem = (field, defaultItem) => {
        setData({ ...data, [field]: [...(data[field] || []), defaultItem] });
    };

    const updateListItem = (field, index, key, val) => {
        const newList = [...(data[field] || [])];
        newList[index] = { ...newList[index], [key]: val };
        setData({ ...data, [field]: newList });
    };

    const removeListItem = (field, index) => {
        setData({ ...data, [field]: (data[field] || []).filter((_, i) => i !== index) });
    };

    const handleProsChange = (field, index, rawText) => {
        const newList = [...(data[field] || [])];
        newList[index] = { ...newList[index], pros: rawText.split('\n').filter(Boolean) };
        setData({ ...data, [field]: newList });
    };

    const handleInclusionsChange = (type, rawText) => {
        const currentInclusions = data.inclusions || { included: [], excluded: [] };
        setData({ ...data, inclusions: { ...currentInclusions, [type]: rawText.split('\n').filter(Boolean) } });
    };

    // Upload image to server and return path
    const handleImageUpload = async (file, callback) => {
        const token = localStorage.getItem('adminToken');
        const fd = new FormData();
        fd.append('images_files[]', file);
        fd.append('_type', 'sur_mesure_upload');
        try {
            const res = await fetch(`${API_BASE}/api/admin/upload-image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            if (res.ok) {
                const json = await res.json();
                callback(json.path || json.url || '');
            }
        } catch {
            // fallback: use object URL (local preview only)
            callback(URL.createObjectURL(file));
        }
    };

    // Update a single gallery image by index
    const updateGalleryImage = (index, url) => {
        const imgs = [...(data.galleryImages || [null, null, null])];
        imgs[index] = url;
        updateField('galleryImages', imgs);
    };

    // Update a séjour card image
    const updateCardImage = (cardIndex, url) => {
        const cards = [...(data.sejourCards || [])];
        cards[cardIndex] = { ...cards[cardIndex], image: url };
        setData({ ...data, sejourCards: cards });
    };

    const galleryImages = data.galleryImages || [null, null, null];

    const sectionClass = "bg-surface p-6 rounded-3xl border border-surface-container-low shadow-sm space-y-5";
    const labelClass = "text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block";
    const inputClass = "w-full minimal-input p-3 bg-surface-container-lowest text-sm";

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">

            {/* ── 0. GALERIE PHOTOS (nouvelle section) */}
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <ImageIcon size={16} className="text-primary" />
                    <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px]">Photos Galerie (3 photos en haut de page)</h5>
                </div>
                <p className="text-[10px] text-on-surface-variant/70">Ces 3 photos apparaissent en grand en haut de la page Sur Mesure.</p>
                <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => (
                        <div key={idx} className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-outline">Photo {idx + 1}</label>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container border border-outline/10 flex items-center justify-center">
                                {galleryImages[idx] ? (
                                    <>
                                        <img
                                            src={getImgUrl(galleryImages[idx])}
                                            className="w-full h-full object-cover"
                                            alt={`Galerie ${idx + 1}`}
                                        />
                                        <button
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                if (window.confirm('Supprimer cette photo ?')) {
                                                    updateGalleryImage(idx, null); 
                                                }
                                            }}
                                            className="absolute top-2 right-2 bg-error text-white rounded-full p-2 hover:bg-error-container hover:text-white transition-all shadow-xl z-30 flex items-center gap-2 group"
                                            title="Supprimer cette photo"
                                        >
                                            <Trash2 size={14} className="group-hover:scale-110 transition-transform"/>
                                            <span className="text-[8px] font-bold uppercase pr-1">Supprimer</span>
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-outline/50 hover:text-primary transition-all p-4 text-center group">
                                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Upload size={20} className="text-primary/60" />
                                        </div>
                                        <span className="text-[9px] uppercase tracking-widest font-bold">Ajouter une photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                if (e.target.files?.[0]) {
                                                    handleImageUpload(e.target.files[0], url => updateGalleryImage(idx, url));
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                            {/* URL directe aussi */}
                            <div className="flex gap-2">
                                <input
                                    value={galleryImages[idx] || ''}
                                    onChange={e => updateGalleryImage(idx, e.target.value)}
                                    className="flex-1 minimal-input p-2 text-[10px] bg-surface-container-lowest border border-outline/10"
                                    placeholder="Lien de l'image..."
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 0b. CARTES SÉJOURS (nouvelle section) */}
            <div className="bg-secondary/5 p-8 rounded-3xl border border-secondary/20 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-bold uppercase tracking-[0.2em] text-secondary text-[11px] mb-1">Cartes "Choisissez votre séjour"</h5>
                        <p className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest font-medium">Les formules avec photos (Ex: Luxe, Aventure...)</p>
                    </div>
                    <button
                        onClick={() => addListItem('sejourCards', { title: '', subtitle: '', description: '', image: null })}
                        className="text-[10px] font-bold uppercase tracking-widest text-white bg-secondary px-5 py-2.5 rounded-xl border border-secondary/20 hover:opacity-90 transition-all flex items-center gap-2 shadow-lg hover:translate-y-[-2px]"
                    >
                        <Plus size={14} /> Nouvelle Formule
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {(data.sejourCards || []).map((card, i) => (
                        <div key={i} className="p-5 border border-outline/10 rounded-[2rem] bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">Formule {i + 1}</span>
                                <button onClick={() => { if(window.confirm('Supprimer cet item de séjour ?')) removeListItem('sejourCards', i); }} className="text-error hover:bg-error-container px-3 py-2 rounded-xl transition-colors flex items-center gap-2 border border-error/10">
                                    <Trash2 size={16} />
                                    <span className="text-[9px] font-bold uppercase">Supprimer</span>
                                </button>
                            </div>

                            {/* Image de la carte */}
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container border border-outline/5 flex items-center justify-center">
                                {card.image ? (
                                    <>
                                        <img src={getImgUrl(card.image)} className="w-full h-full object-cover" alt="" />
                                        <button
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                if (window.confirm('Supprimer cette photo de carte ?')) {
                                                    updateCardImage(i, null);
                                                }
                                            }}
                                            className="absolute top-2 right-2 bg-error text-white rounded-full p-2 hover:bg-error-container transition-all shadow-lg z-10 flex items-center gap-2 group"
                                        >
                                            <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[8px] font-bold uppercase pr-1">Supprimer</span>
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-outline/50 hover:text-secondary transition-all p-6 group">
                                        <div className="w-12 h-12 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                                            <Upload size={24} className="text-secondary/60" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Photo de couverture</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                if (e.target.files?.[0]) {
                                                    handleImageUpload(e.target.files[0], url => updateCardImage(i, url));
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                            <input
                                value={card.image || ''}
                                onChange={e => updateListItem('sejourCards', i, 'image', e.target.value)}
                                className="w-full minimal-input p-2 text-[10px] bg-surface"
                                placeholder="Ou URL de la photo..."
                            />

                            <div>
                                <label className={labelClass}>Titre de la carte</label>
                                <input
                                    value={card.title || ''}
                                    onChange={e => updateListItem('sejourCards', i, 'title', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ex: Séjour sur-mesure à Marrakech"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Sous-titre / Tag</label>
                                <input
                                    value={card.subtitle || ''}
                                    onChange={e => updateListItem('sejourCards', i, 'subtitle', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ex: Riad au choix • Activités modulables"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Description courte</label>
                                <textarea
                                    rows="2"
                                    value={card.description || ''}
                                    onChange={e => updateListItem('sejourCards', i, 'description', e.target.value)}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Ex: Budget flexible"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {(data.sejourCards || []).length === 0 && (
                    <div className="text-center py-8 border border-dashed border-secondary/20 rounded-2xl">
                        <p className="text-on-surface-variant/50 text-sm italic mb-3">Aucune carte pour l'instant.</p>
                        <button
                            onClick={() => addListItem('sejourCards', { title: 'Séjour sur-mesure à Marrakech', subtitle: 'Riad au choix • Activités modulables', description: 'Budget flexible', image: null })}
                            className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-1 mx-auto"
                        >
                            <Plus size={12} /> Créer la première carte
                        </button>
                    </div>
                )}
            </div>

            {/* ── 1. Hero Section */}
            <div className={sectionClass}>
                <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px] mb-4">1. En-tête (Hero)</h5>
                <div>
                    <label className={labelClass}>Titre Principal</label>
                    <input value={data.hero_title || ''} onChange={e => updateField('hero_title', e.target.value)} className={inputClass} placeholder="Ex: Séjour sur mesure à Marrakech" />
                </div>
                <div>
                    <label className={labelClass}>Sous-titre / Paragraphe</label>
                    <textarea rows="3" value={data.hero_subtitle || ''} onChange={e => updateField('hero_subtitle', e.target.value)} className={`${inputClass} resize-none`} placeholder="Ex: Votre Marrakech..." />
                </div>
                <div>
                    <label className={labelClass}>Tags / Mots-clés (1 par ligne)</label>
                    <textarea rows="4" value={((data.heroTags) || []).join('\n')} onChange={e => setData({ ...data, heroTags: e.target.value.split('\n').filter(Boolean) })} className={`${inputClass} resize-none`} placeholder={"100% privé\nHébergements vérifiés..."} />
                </div>
            </div>

            {/* ── Infos clés */}
            <div className={sectionClass}>
                <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px] mb-4">Infos Clés (Chiffres & Résumé)</h5>
                <div className="grid sm:grid-cols-2 gap-4">
                    {(data.keyInfos || []).map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 border border-outline/10 rounded-xl bg-surface-container-lowest items-center">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <input value={item.label || ''} onChange={e => updateListItem('keyInfos', i, 'label', e.target.value)} className="w-full minimal-input p-2 text-xs font-bold uppercase tracking-widest bg-surface" placeholder="Ex: Durée" />
                                <input value={item.value || ''} onChange={e => updateListItem('keyInfos', i, 'value', e.target.value)} className="w-full minimal-input p-2 text-sm bg-surface" placeholder="Ex: 5 Jours" />
                            </div>
                            <button onClick={() => removeListItem('keyInfos', i)} className="text-error hover:bg-error-container p-2 rounded-xl h-fit"><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>
                <button onClick={() => addListItem('keyInfos', { label: '', value: '', icon: '💎' })} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1"><Plus size={14} /> Ajouter une info-clé</button>
            </div>

            {/* ── 2. Target Audiences */}
            <div className={sectionClass}>
                <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px] mb-4">2. Pour qui est fait ce séjour ?</h5>
                {(data.targetAudiences || []).map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-outline/10 rounded-xl bg-surface-container-lowest">
                        <div className="flex-1 space-y-3">
                            <input value={item.title || ''} onChange={e => updateListItem('targetAudiences', i, 'title', e.target.value)} className="w-full minimal-input p-3 text-sm font-bold bg-surface" placeholder="Ex: Couples en lune de miel" />
                            <textarea rows="2" value={item.desc || ''} onChange={e => updateListItem('targetAudiences', i, 'desc', e.target.value)} className="w-full minimal-input p-3 text-sm bg-surface resize-none" placeholder="Description" />
                        </div>
                        <button onClick={() => removeListItem('targetAudiences', i)} className="text-error hover:bg-error-container p-2 rounded-xl h-fit"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button onClick={() => addListItem('targetAudiences', { title: '', desc: '', icon: '✨' })} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1"><Plus size={14} /> Ajouter un profil</button>
            </div>

            {/* ── Why Choose Us */}
            <div className={sectionClass}>
                <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px] mb-4">Pourquoi choisir Just Marrakech ?</h5>
                {(data.whyChooseUs || []).map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-outline/10 rounded-xl bg-surface-container-lowest">
                        <div className="flex-1 space-y-3">
                            <input value={item.title || ''} onChange={e => updateListItem('whyChooseUs', i, 'title', e.target.value)} className="w-full minimal-input p-3 text-sm font-bold bg-surface" placeholder="Titre de la raison" />
                            <textarea rows="2" value={item.desc || ''} onChange={e => updateListItem('whyChooseUs', i, 'desc', e.target.value)} className="w-full minimal-input p-3 text-sm bg-surface resize-none" placeholder="Description courte" />
                        </div>
                        <button onClick={() => removeListItem('whyChooseUs', i)} className="text-error hover:bg-error-container p-2 rounded-xl h-fit"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button onClick={() => addListItem('whyChooseUs', { title: '', desc: '' })} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1"><Plus size={14} /> Ajouter un argument</button>
            </div>

            {/* ── 3. Formulas */}
            <div className={sectionClass}>
                <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px]">3. Formules Proposées (Détails)</h5>
                    <button onClick={() => addListItem('formulas', { title: '', duration: '', desc: '', pros: [] })} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                        <Plus size={14} /> Ajouter une formule
                    </button>
                </div>
                {(data.formulas || []).map((item, i) => (
                    <div key={i} className="p-6 border border-outline/10 rounded-[2rem] bg-white space-y-4 shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-outline mb-1 block tracking-widest">Nom de formule</label>
                                    <input value={item.title || ''} onChange={e => updateListItem('formulas', i, 'title', e.target.value)} className="w-full minimal-input p-3 text-sm font-bold bg-surface-container-lowest" placeholder="Ex: Premium" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-outline mb-1 block tracking-widest">Durée</label>
                                    <input value={item.duration || ''} onChange={e => updateListItem('formulas', i, 'duration', e.target.value)} className="w-full minimal-input p-3 text-sm bg-surface-container-lowest" placeholder="Ex: 5 jours / 4 nuits" />
                                </div>
                            </div>
                            <button onClick={() => { if(window.confirm('Supprimer cette formule ?')) removeListItem('formulas', i); }} className="text-outline/40 hover:text-error transition-colors p-2">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-outline mb-1 block tracking-widest">Description courte</label>
                            <input value={item.desc || ''} onChange={e => updateListItem('formulas', i, 'desc', e.target.value)} className="w-full minimal-input p-3 text-sm bg-surface-container-lowest" placeholder="Ex: Le luxe ultime..." />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-outline mb-1 block tracking-widest">Inclusions (Une par ligne)</label>
                            <textarea rows="4" value={(item.pros || []).join('\n')} onChange={e => handleProsChange('formulas', i, e.target.value)} className="w-full minimal-input p-3 text-sm bg-surface-container-lowest resize-none" placeholder={"- Hébergement 5 étoiles\n- Majordome privé..."} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 4. Programs */}
            <div className={sectionClass}>
                <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px] mb-4">4. Exemple de Programmes</h5>
                {(data.programs || []).map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-outline/10 rounded-xl bg-surface-container-lowest">
                        <div className="flex-1 space-y-3">
                            <input value={item.title || ''} onChange={e => updateListItem('programs', i, 'title', e.target.value)} className="w-full minimal-input p-3 text-sm font-bold bg-surface" placeholder="Ex: Jour 1 - Découverte" />
                            <textarea rows="3" value={item.desc || ''} onChange={e => updateListItem('programs', i, 'desc', e.target.value)} className="w-full minimal-input p-3 text-sm bg-surface resize-none" placeholder="Description du programme..." />
                        </div>
                        <button onClick={() => removeListItem('programs', i)} className="text-error hover:bg-error-container p-2 rounded-xl h-fit"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button onClick={() => addListItem('programs', { title: '', desc: '' })} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1"><Plus size={14} /> Ajouter un programme</button>
            </div>

            {/* ── Inclusions */}
            <div className={sectionClass}>
                <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px] mb-4">Inclus / Non Inclus</h5>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-secondary" /> Ce qui est inclus (1 par ligne)</label>
                        <textarea rows="6" value={((data.inclusions?.included) || []).join('\n')} onChange={e => handleInclusionsChange('included', e.target.value)} className="w-full minimal-input p-4 bg-surface-container-lowest text-sm resize-none" placeholder="- Hébergement..." />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-error mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-error" /> Ce qui n'est pas inclus</label>
                        <textarea rows="6" value={((data.inclusions?.excluded) || []).join('\n')} onChange={e => handleInclusionsChange('excluded', e.target.value)} className="w-full minimal-input p-4 bg-surface-container-lowest text-sm resize-none" placeholder="- Vols..." />
                    </div>
                </div>
            </div>

            {/* ── Practical Infos */}
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
                <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px] mb-2">Informations Pratiques</h5>
                {(data.practicalInfos || []).map((item, i) => (
                    <div key={i} className="flex gap-3 p-3 border border-outline/10 rounded-xl bg-surface items-center">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <input value={item.label || ''} onChange={e => updateListItem('practicalInfos', i, 'label', e.target.value)} className="w-full minimal-input p-2 text-sm bg-surface-container-lowest" placeholder="Ex: Horaires" />
                            <input value={item.value || ''} onChange={e => updateListItem('practicalInfos', i, 'value', e.target.value)} className="w-full minimal-input p-2 text-sm font-bold bg-surface-container-lowest text-right" placeholder="Ex: Flexible" />
                        </div>
                        <button onClick={() => removeListItem('practicalInfos', i)} className="text-error hover:bg-error-container p-2 rounded-xl h-fit"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button onClick={() => addListItem('practicalInfos', { label: '', value: '' })} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1"><Plus size={14} /> Ajouter une ligne pratique</button>
            </div>

            {/* ── 5. FAQ */}
            <div className={sectionClass}>
                <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold uppercase tracking-[0.2em] text-primary text-[10px]">5. Foire Aux Questions (FAQ)</h5>
                    <button onClick={() => addListItem('faqs', { q: '', a: '' })} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                        <Plus size={14} /> Ajouter une question
                    </button>
                </div>
                {(data.faqs || []).map((faq, i) => (
                    <div key={i} className="flex gap-4 p-5 border border-outline/10 rounded-[2rem] bg-white shadow-sm flex-col sm:flex-row items-end sm:items-start group">
                        <div className="flex-1 space-y-4 w-full">
                            <div>
                                <label className="text-[9px] font-bold uppercase text-outline mb-1 block tracking-widest">Question</label>
                                <input value={faq.q || ''} onChange={e => updateListItem('faqs', i, 'q', e.target.value)} className="w-full minimal-input p-4 text-sm font-bold bg-surface-container-lowest" placeholder="Question..." />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-outline mb-1 block tracking-widest">Réponse</label>
                                <textarea rows="3" value={faq.a || ''} onChange={e => updateListItem('faqs', i, 'a', e.target.value)} className="w-full minimal-input p-4 text-sm bg-surface-container-lowest resize-none" placeholder="Réponse détaillée..." />
                            </div>
                        </div>
                        <button onClick={() => { if(window.confirm('Supprimer cette question ?')) removeListItem('faqs', i); }} className="text-error bg-error/5 hover:bg-error-container p-4 rounded-2xl transition-all border border-error/10">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
