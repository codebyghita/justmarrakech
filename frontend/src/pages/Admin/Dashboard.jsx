import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, LogOut, Plus, Trash2, X, Eye, EyeOff, Settings, MessageSquare, Layers, FileText, Save, Image as ImageIcon, CheckCircle, Menu, ExternalLink, Upload, Check, ChevronDown, Copy, MapPin } from 'lucide-react';
import SurMesureEditor from './SurMesureEditor';
import MediaPicker from '../../components/Admin/MediaPicker';
import { getAssetUrl } from '../../utils/assets';

const API_BASE = '/api';

export default function Dashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState('catalog_activities');

  const [items, setItems] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);

  const [blockTargetType, setBlockTargetType] = useState('global');
  const [blockTargetId, setBlockTargetId] = useState(0);
  const [allActivities, setAllActivities] = useState([]);
  const [allAccommodations, setAllAccommodations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cmsBlocks, setCmsBlocks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [surMesureData, setSurMesureData] = useState({
    hero_title: '', hero_subtitle: '',
    targetAudiences: [], keyInfos: [], whyChooseUs: [], programs: [], formulas: [], inclusions: { included: [], excluded: [] }, faqs: [],
    sejourCards: []
  });

  const [mediaList, setMediaList] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);


  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerConfig, setMediaPickerConfig] = useState({ multi: true, onSelect: () => {} });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local state for dynamic lists
  const [includedList, setIncludedList] = useState([]);
  const [notIncludedList, setNotIncludedList] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [badgesInput, setBadgesInput] = useState('');

  // Axios instance with auth header
  const api = useCallback(() => axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (view === 'activities' || view.startsWith('catalog_')) {
        const [itemsRes, catRes] = await Promise.all([
          api().get(`/admin/activities`),
          api().get('/admin/categories')
        ]);
        const categories = catRes.data;
        let allActivities = itemsRes.data;
        const excursionsCat = categories.find(c => c.slug === 'excursions');

        if (view === 'catalog_excursions') {
          allActivities = allActivities.filter(a => a.activity_category_id === (excursionsCat?.id));
        } else if (view === 'catalog_activities') {
          allActivities = allActivities.filter(a => a.activity_category_id !== (excursionsCat?.id));
        }
        setItems(allActivities);
        setCategories(categories);
      } else if (view === 'calendar') {
        const [calRes, actRes, accRes] = await Promise.all([
          api().get('/admin/calendar'),
          api().get('/admin/activities'),
          api().get('/admin/accommodations'),
        ]);
        setBlockedDates(Array.isArray(calRes.data) ? calRes.data : []);
        setAllActivities(Array.isArray(actRes.data) ? actRes.data : []);
        setAllAccommodations(Array.isArray(accRes.data) ? accRes.data : []);
      } else if (view === 'categories') {
        const res = await api().get('/admin/categories');
        setItems(res.data);
      } else if (view.startsWith('cms_') || view === 'sur_mesure') {
        const res = await api().get('/admin/cms');
        setCmsBlocks(res.data);
      } else if (view === 'reviews') {
        const res = await api().get('/admin/reviews');
        setReviews(res.data);
      } else if (view === 'settings') {
        const res = await api().get('/admin/settings');
        setSiteSettings(res.data);
      } else if (view === 'blog') {
        const res = await api().get('/admin/blog');
        setItems(res.data);
      } else if (view === 'media') {
        fetchMedia();
      }

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, view, api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (view === 'sur_mesure' && cmsBlocks.length > 0) {
      const block = cmsBlocks.find(b => b.slug === 'sur-mesure-content');
      if (block && block.content) {
        try {
          setSurMesureData(typeof block.content === 'string' ? JSON.parse(block.content) : block.content);
        } catch (e) { console.error('Parse error sur-mesure-content', e); }
      }
    }
  }, [view, cmsBlocks]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
    } catch {
      setLoginError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const fetchMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await api().get('/admin/media');
      setMediaList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append('files[]', files[i]);
    }

    setMediaLoading(true);
    try {
      await api().post('/admin/media', fd);
      fetchMedia();
    } catch (err) {
      alert('Erreur lors de l’upload');
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaDelete = async (path) => {
    if (!confirm('Supprimer ce fichier ?')) return;
    try {
      await api().delete('/admin/media', { data: { path } });
      fetchMedia();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const saveSurMesure = async () => {
    setLoading(true);
    try {
      const payload = {
        slug: 'sur-mesure-content',
        section: 'sur-mesure',
        type: 'json',
        content: surMesureData
      };
      // We find if block exists
      const existingBlock = cmsBlocks.find(b => b.slug === 'sur-mesure-content');
      if (existingBlock) {
        await api().post(`/admin/cms/${existingBlock.id}`, { ...payload, _method: 'PUT' });
      } else {
        await api().post('/admin/cms', payload);
      }
      alert('Page Sur Mesure enregistrée avec succès !');
      fetchData();
    } catch (err) {
      console.error(err);
      const errors = err.response?.data?.errors;
      let msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      if (errors) {
        msg = Object.values(errors).flat().join('\n');
      }
      alert('Erreur: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllCms = async () => {
    setLoading(true);
    try {
      const page = view.replace('cms_', '');
      const pageBlocks = cmsBlocks.filter(b => {
        if (page === 'home') return b.slug.startsWith('home-');
        return b.slug.startsWith(`${page}-`);
      });

      // Loop and save each block
      // Using Promise.all for faster execution, but sequentially might be safer for rate limits
      // Let's do sequential to be safe with the new translation service
      for (const block of pageBlocks) {
        await api().put(`/admin/cms/${block.id}`, block);
      }

      alert('Toutes les modifications de la page ont été enregistrées !');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’enregistrement de certains blocs.');
    } finally {
      setLoading(false);
    }
  };


  const blockDate = async () => {
    if (!newDate) return;
    try {
      // Use specific target or global block
      await api().post('/admin/calendar', {
        unavailable_type: blockTargetType,
        unavailable_id: blockTargetId,
        date: newDate
      });
      setNewDate('');
      fetchData();
    } catch (err) {
      alert('Erreur lors du blocage de la date.');
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    let initialData = { status: 'published' };
    if (view === 'categories') initialData = { status: 'published', sort_order: 0, badges: [] };

    // Auto-assign category for excursions
    if (view === 'catalog_excursions') {
      const excCat = categories.find(c => c.slug === 'excursions');
      if (excCat) initialData.activity_category_id = excCat.id;
    }

    setFormData(initialData);
    setBadgesInput('');
    setIncludedList([]);
    setNotIncludedList([]);
    setExistingImages([]);
    setImageFiles([]);
    setFormError('');
    setShowModal(true);
  };


  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    if (view.startsWith('catalog_')) {
      setIncludedList(item.included || []);
      setNotIncludedList(item.not_included || []);
      setExistingImages(item.images || []);
    } else if (view === 'categories') {
      setExistingImages(item.image ? [item.image] : []);
      setBadgesInput(Array.isArray(item.badges) ? item.badges.join(', ') : (item.badges || ''));
    } else if (view === 'blog') {
      setExistingImages(item.image ? [item.image] : []);
    }
    setImageFiles([]);
    setFormError('');
    setShowModal(true);
  };


  const requestDelete = (id, type) => {
    setDeleteTarget({ id, type });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'calendar') {
        await api().delete(`/admin/calendar/${deleteTarget.id}`);
      } else {
        await api().delete(`/admin/${deleteTarget.type}/${deleteTarget.id}`);
      }
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      // Clean up values: handle booleans and nulls
      let val = formData[key];
      if (val === true) val = '1';
      else if (val === false) val = '0';
      else if (val === null || val === undefined || val === 'null') val = '';

      // For categories and blogs, avoid sending the 'image' string if we have a NEW file to upload
      if (key === 'image' && imageFiles.length > 0) return;

      // FIX FOR MYSQL INTEGER ERROR (max_persons, etc.)
      const numericFields = ['max_persons', 'activity_category_id', 'price_from', 'sort_order'];
      if (numericFields.includes(key) && (val === '' || val === null || val === undefined)) {
        return; // Skip appending
      }

      // Exclude fields that are arrays/objects and need special handling
      const complexFields = ['images', 'included', 'not_included', 'formulas', 'faq', 'practical_info_points', 'imageFile', 'badges', 'pricing_details', 'activityCategory', 'timeline'];
      if (!complexFields.includes(key)) {
        formDataObj.append(key, val);
      }
    });

    // Send all new files
    imageFiles.forEach(file => {
      formDataObj.append('images_files[]', file);
    });

    // Send complex fields as JSON strings
    formDataObj.append('existing_images', JSON.stringify(existingImages));
    formDataObj.append('included', JSON.stringify(includedList));
    formDataObj.append('not_included', JSON.stringify(notIncludedList));

    // Stringify complex Activity fields
    if (view.startsWith('catalog_')) {
      if (formData.formulas) {
        const processedFormulas = formData.formulas.map(f => ({
          title: f.title || f.name,
          details: f.details,
          price: f.price,
          price_type: f.price_type || 'person',
          includes: f.includes_text !== undefined ? f.includes_text.split('\n').filter(Boolean) : (f.includes || [])
        }));
        formDataObj.append('formulas', JSON.stringify(processedFormulas));
      }

      // Store pricing_details (person-based pricing)
      if (formData.pricing_details) {
        formDataObj.append('pricing_details', JSON.stringify(formData.pricing_details));
      }

      if (formData.faq) formDataObj.append('faq', JSON.stringify(formData.faq));
      if (formData.practical_info_points) formDataObj.append('practical_info_points', JSON.stringify(formData.practical_info_points));
      if (formData.timeline) formDataObj.append('timeline', JSON.stringify(formData.timeline));

      // Ensure numeric fields are null if empty to avoid validation errors
      if (formData.max_persons === '' || formData.max_persons === undefined) {
        formDataObj.set('max_persons', '');
      }
    }

    // Handle badges for categories (sent as JSON string so backend can decode it)
    if (view === 'categories') {
      formDataObj.append('badges', JSON.stringify(formData.badges || []));
    }


    try {
      if (view === 'settings') {
        const payload = {};
        Object.keys(siteSettings).forEach(k => {
          if (siteSettings[k]) payload[k] = siteSettings[k].value;
        });
        await api().post('/admin/settings', payload);
      } else if (view.startsWith('cms_')) {
        await api().put(`/admin/cms/${editingItem.id}`, formData);
        setShowModal(false);
        await fetchData();
      } else {
        const apiTarget = view.startsWith('catalog_') ? 'activities' : view;

      if (editingItem) {
        formDataObj.append('_method', 'PUT');
        await api().post(`/admin/${apiTarget}/${editingItem.id}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api().post(`/admin/${apiTarget}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({});
        await fetchData();
      }
    } catch (err) {
      console.error('Détails erreur:', err.response?.data || err);
      const errors = err.response?.data?.errors;
      let msg = err.response?.data?.message || err.message || "Erreur inconnue.";
      if (errors) {
        msg = Object.values(errors).flat().join('\n');
      }
      
      alert('❌ ÉCHEC DE L\'ENREGISTREMENT :\n' + msg);
      setFormError(msg);
      
      // Si c'est une erreur 500 mais que ça a peut-être sauvé (rare), on rafraîchit
      if (err.response?.status === 500) {
        setShowModal(false);
        await fetchData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilesChange = (e) => {
    if (e.target.files) {
      setImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const addListItem = (target) => {
    if (target === 'included') setIncludedList(prev => [...prev, '']);
    else setNotIncludedList(prev => [...prev, '']);
  };

  const removeListItem = (target, index) => {
    if (target === 'included') setIncludedList(prev => prev.filter((_, i) => i !== index));
    else setNotIncludedList(prev => prev.filter((_, i) => i !== index));
  };

  const updateListItem = (target, index, val) => {
    if (target === 'included') {
      const newList = [...includedList];
      newList[index] = val;
      setIncludedList(newList);
    } else {
      const newList = [...notIncludedList];
      newList[index] = val;
      setNotIncludedList(newList);
    }
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="bg-surface-container-lowest p-10 rounded-3xl sand-shadow w-full max-w-md border border-white">
          <h1 className="display-font text-4xl text-primary text-center mb-2 italic">Espace Partenaire</h1>
          <p className="text-center text-on-surface-variant text-sm mb-10 tracking-widest uppercase text-xs">Just Marrakech · Admin</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full minimal-input p-4 bg-surface"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full minimal-input p-4 bg-surface pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {loginError && (
              <p className="text-error text-sm bg-error-container/30 px-4 py-3 rounded-xl border border-error/20">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
            >
              Connexion
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      section: 'Gestion du Contenu', items: [
        { key: 'cms_home', label: 'Page Accueil', icon: <FileText size={14} /> },
        { key: 'cms_activities', label: 'Page Activités', icon: <FileText size={14} /> },
        { key: 'cms_excursions', label: 'Page Excursions', icon: <FileText size={14} /> },
        { key: 'cms_blog', label: 'Page Blog', icon: <FileText size={14} /> },
        { key: 'sur_mesure', label: 'Page Sur Mesure', icon: <CheckCircle size={14} /> },
      ]
    },
    {
      section: 'Catalogue & Ventes', items: [
        { key: 'catalog_activities', label: 'Gérer Activités', icon: <Layers size={14} /> },
        { key: 'catalog_excursions', label: 'Gérer Excursions', icon: <Layers size={14} /> },
        { key: 'categories', label: 'Catégories', icon: <Layers size={14} /> },
        { key: 'blog', label: 'Gérer le Blog', icon: <FileText size={14} /> },
        { key: 'calendar', label: 'Calendrier', icon: <CalendarIcon size={14} /> },
        { key: 'media', label: 'Médiathèque', icon: <ImageIcon size={14} /> },
        { key: 'reviews', label: 'Avis Clients', icon: <MessageSquare size={14} /> },
      ]
    },
    {
      section: 'Configuration', items: [
        { key: 'settings', label: 'Paramètres', icon: <Settings size={14} /> },
        { key: 'account', label: 'Mon Compte', icon: <CheckCircle size={14} /> },
      ]
    },
  ];

  // ── MAIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-6rem)] bg-surface-container-low max-w-7xl mx-auto rounded-3xl overflow-hidden flex shadow-2xl border border-white/50 relative">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 md:z-auto w-72 md:w-64 bg-surface-container-highest flex-col flex shrink-0 transition-transform duration-300 ease-in-out rounded-r-3xl md:rounded-none shadow-2xl md:shadow-none overflow-hidden`}
        style={{ height: '100dvh' }}
      >
        {/* Sidebar Header — fixe */}
        <div className="px-6 pt-6 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="display-font text-xl text-primary">Just Marrakech</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-on-surface-variant hover:text-primary p-1 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <p className="text-[9px] text-outline uppercase tracking-widest">Panneau d'administration</p>
        </div>

        {/* Nav — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 min-h-0">
          {navItems.map(({ section, items }) => (
            <div key={section}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-2 px-2">{section}</p>
              <div className="space-y-0.5">
                {items.map(({ key, label, icon }) => (
                  <button key={key} onClick={() => { setView(key); setSidebarOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all ${view === key ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout — fixe en bas */}
        <div className="px-4 py-4 shrink-0 border-t border-outline/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-error text-xs font-bold uppercase tracking-widest hover:bg-error-container px-3 py-2.5 rounded-xl transition-all"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-surface-container-lowest p-4 md:p-8 lg:p-10 overflow-y-auto">

        {/* Mobile header */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 bg-surface px-4 py-2.5 rounded-xl border border-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
          >
            <Menu size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Menu</span>
          </button>
          <h2 className="display-font text-xl text-primary italic">Just Marrakech</h2>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
          <div className="bg-surface p-3 md:p-5 rounded-2xl border border-surface-container-low">
            <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1 hidden sm:block">
              Total Activités
            </p>
            <p className="display-font text-2xl md:text-3xl text-primary">{items.length}</p>
            <p className="text-[8px] text-outline uppercase sm:hidden">Activités</p>
          </div>
          <div className="bg-surface p-3 md:p-5 rounded-2xl border border-surface-container-low">
            <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1 hidden sm:block">Réservations</p>
            <p className="display-font text-2xl md:text-3xl text-secondary">WA</p>
            <p className="text-[8px] text-outline uppercase sm:hidden">Résa</p>
          </div>
          <div className="bg-surface p-3 md:p-5 rounded-2xl border border-surface-container-low">
            <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1 hidden sm:block">Statut</p>
            <p className="display-font text-2xl md:text-3xl text-tertiary">✓</p>
            <p className="text-[8px] text-outline uppercase sm:hidden">En ligne</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b border-surface-container-low">
          <h3 className="display-font text-2xl md:text-4xl text-primary italic capitalize">
            {
              view === 'calendar' ? 'Disponibilités' :
                view.startsWith('catalog_') ? (view === 'catalog_excursions' ? 'Catalogue Excursions' : 'Catalogue Activités') :
                  view === 'categories' ? "Catégories" :
                    view === 'blog' ? 'Blog' :
                      view === 'sur_mesure' ? 'Sur Mesure' :
                        view.startsWith('cms_') ? `Textes : ${view.replace('cms_', '')}` :
                          view === 'reviews' ? 'Avis Clients' :
                            'Réglages'
            }
          </h3>

          {!['calendar', 'settings', 'sur_mesure'].includes(view) && !view.startsWith('cms_') && (
            <button onClick={handleAdd} className="bg-primary text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl uppercase tracking-widest text-[10px] font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md">
              <Plus size={14} /> <span className="hidden sm:inline">Nouvel Item</span><span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>

        {/* ── CALENDAR VIEW ── */}
        {view === 'calendar' && (
          <div className="max-w-xl">
            <p className="text-on-surface-variant mb-8 leading-relaxed font-light text-sm">
              Bloquez les dates indisponibles. Les voyageurs verront ces jours-là comme complets dans le formulaire de réservation.
            </p>
            <div className="bg-surface p-5 rounded-2xl border border-surface-container-low mb-10 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Cible du blocage</label>
                <select
                  value={blockTargetType}
                  onChange={e => {
                    setBlockTargetType(e.target.value);
                    setBlockTargetId(0);
                  }}
                  className="w-full minimal-input p-3 bg-surface focus:ring-1 focus:ring-primary/20 outline-none"
                >
                  <option value="global">Global (Tout bloquer)</option>
                  <option value="App\Models\Activity">Activité ou Excursion spécifique</option>
                </select>
              </div>

              {blockTargetType === 'App\\Models\\Activity' && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Choisir l'élément (Activité/Excursion)</label>
                  <select
                    value={blockTargetId}
                    onChange={e => setBlockTargetId(e.target.value)}
                    className="w-full minimal-input p-3 bg-surface focus:ring-1 focus:ring-primary/20 outline-none"
                  >
                    <option value={0} disabled>Sélectionnez...</option>
                    {allActivities.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.title} {a.activity_category_id === (categories.find(c => c.slug === 'excursions')?.id) ? '(Excursion)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="minimal-input bg-surface flex-1 px-4 py-3 border border-outline-variant/30 text-sm"
                />
                <button onClick={blockDate} disabled={blockTargetType !== 'global' && blockTargetId == 0} className="bg-secondary text-white px-5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity whitespace-nowrap">
                  Bloquer
                </button>
              </div>
            </div>

            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-outline mb-4">Dates bloquées</h4>
            <div className="space-y-3">
              {blockedDates.map(d => {
                let targetName = "Globalement bloqué";
                if (d.unavailable_type === 'App\\Models\\Accommodation') {
                  const acc = allAccommodations.find(a => a.id == d.unavailable_id);
                  targetName = acc ? `Hébergement : ${acc.title}` : "Hébergement";
                } else if (d.unavailable_type === 'App\\Models\\Activity') {
                  const act = allActivities.find(a => a.id == d.unavailable_id);
                  targetName = act ? `Activité : ${act.title}` : "Activité";
                }

                return (
                  <div key={d.id} className="flex justify-between items-center bg-surface px-6 py-4 rounded-xl border border-surface-container-low hover:border-error/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <CalendarIcon size={16} className="text-error" />
                      <div className="flex flex-col">
                        <span className="font-semibold">{new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="text-[10px] uppercase font-bold text-outline">{targetName}</span>
                      </div>
                    </div>
                    <button onClick={() => requestDelete(d.id, 'calendar')} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-error-container">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
              {!loading && blockedDates.length === 0 && (
                <p className="text-on-surface-variant/50 italic text-sm py-4">Aucune date bloquée pour le moment.</p>
              )}
            </div>
          </div>
        )}

        {/* ── REVIEWS VIEW ── */}
        {view === 'reviews' && (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-surface p-6 rounded-2xl border border-surface-container-low">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-primary">{r.name}</h4>
                    <div className="flex gap-1 my-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < r.rating ? 'text-secondary' : 'text-outline-variant'}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={async (e) => {
                        await api().put(`/admin/reviews/${r.id}/status`, { status: e.target.value });
                        fetchData();
                      }}
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:outline-none ${r.status === 'approved' ? 'bg-secondary-container text-secondary border-secondary/20' :
                          r.status === 'pending' ? 'bg-surface-container-high text-outline border-outline/20' :
                            'bg-error-container text-error border-error/20'
                        }`}
                    >
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvé</option>
                      <option value="rejected">Refusé</option>
                    </select>
                    <button onClick={() => requestDelete(r.id, 'reviews')} className="text-outline/40 hover:text-error p-2"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">"{r.comment}"</p>
                <div className="mt-4 pt-4 border-t border-surface-container-low flex justify-between items-center text-[10px] uppercase font-bold text-outline-variant">
                  <span>{r.reviewable_type?.split('\\').pop() || 'Global'} #{r.reviewable_id}</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SUR MESURE VIEW ── */}
        {view === 'sur_mesure' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-surface p-6 rounded-3xl border border-surface-container-low shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="display-font text-2xl text-primary">Contenu Page Sur Mesure</h4>
                  <span className="bg-secondary/10 text-secondary text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md border border-secondary/20">Mode Édition</span>
                </div>
                <p className="text-sm text-on-surface-variant font-light">Gérez les textes et photos de la landing page publique. <strong className="text-primary font-semibold">Ceci met à jour directement la page client existante.</strong></p>
              </div>
              <button onClick={saveSurMesure} className="bg-primary text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-md hover:scale-105 transition-transform">
                <Save size={16} /> Enregistrer
              </button>
            </div>
            <SurMesureEditor data={surMesureData} setData={setSurMesureData} onSave={saveSurMesure} isSaving={loading} />
          </div>
        )}

        {/* ── CMS VIEW ── */}
        {view.startsWith('cms_') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl border border-surface-container shadow-sm">
              <div>
                <h4 className="display-font text-3xl text-primary mb-2 italic capitalize">Page {view.replace('cms_', '')}</h4>
                <p className="text-sm text-on-surface-variant font-light">Modifiez l'image héro et les textes principaux de cette section.</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* We filter the blocks for this page and show them as a form */}
              {cmsBlocks
                .filter(b => {
                  const page = view.replace('cms_', '');
                  if (!b || !b.slug) return false;
                  if (page === 'home') return b.slug.startsWith('home-');
                  return b.slug.startsWith(`${page}-`);
                })
                .sort((a, b) => a.id - b.id)
                .map(originalBlock => {
                  const block = { ...originalBlock };
                  if (block.content === "Array") block.content = block.type === 'json' ? [] : "";
                  return (
                    <div key={block.id} className="p-6 bg-surface-container-lowest rounded-2xl border border-surface-container-low">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">
                        {block.slug?.split('-').slice(1).join(' ') || 'Unnamed Block'}
                      </label>

                      {/* Data cleanup is now done before render to avoid state mutation */}

                      {block.slug?.includes('-image') || block.slug?.includes('-hero-img') ? (
                        <div className="space-y-4">
                          <div className="flex gap-6 items-center bg-white p-4 rounded-2xl border border-surface-container shadow-sm">
                            <div className="w-32 h-20 rounded-xl overflow-hidden border border-outline/10 bg-surface-container flex items-center justify-center shrink-0">
                              {(block.content && block.content !== '') ? (
                                <img
                                  src={block.content.startsWith('http') ? block.content : `${block.content}`}
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              ) : (
                                <ImageIcon size={24} className="text-outline-variant opacity-40" />
                              )}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex gap-2">
                                <label className="flex-1">
                                  <div className="bg-primary/5 text-primary border border-primary/10 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors cursor-pointer text-center flex items-center justify-center gap-2">
                                    <Upload size={14} /> {block.content ? 'Remplacer' : 'Choisir une photo'}
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      const fd = new FormData();
                                      fd.append('image', file);
                                      try {
                                        const res = await api().post('/admin/upload-image', fd);
                                        await api().put(`/admin/cms/${block.id}`, { ...block, content: res.data.path });
                                        fetchData();
                                      } catch (err) { alert('Erreur upload'); }
                                    }}
                                  />
                                </label>
                                {block.content && (
                                  <button
                                    onClick={async () => {
                                      if (confirm('Supprimer cette photo ?')) {
                                        await api().put(`/admin/cms/${block.id}`, { ...block, content: '' });
                                        fetchData();
                                      }
                                    }}
                                    className="bg-error/5 text-error border border-error/10 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-error-container transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              <p className="text-[9px] text-outline italic">Format: 1920x1080px recommandé</p>
                            </div>
                          </div>
                        </div>
                      ) : block.type === 'json' ? (
                        <textarea
                          rows="6"
                          value={typeof block.content === 'string' ? block.content : (block.content ? JSON.stringify(block.content, null, 2) : '')}
                          onChange={e => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              const next = cmsBlocks.map(b => b.id === block.id ? { ...b, content: parsed } : b);
                              setCmsBlocks(next);
                            } catch (err) {
                              const next = cmsBlocks.map(b => b.id === block.id ? { ...b, content: e.target.value } : b);
                              setCmsBlocks(next);
                            }
                          }}
                          className="w-full minimal-input p-4 bg-white font-mono text-xs border border-surface-container"
                        ></textarea>
                      ) : (
                        <textarea
                          rows="3"
                          value={block.content || ''}
                          onChange={e => {
                            const next = cmsBlocks.map(b => b.id === block.id ? { ...b, content: e.target.value } : b);
                            setCmsBlocks(next);
                          }}
                          className="w-full minimal-input p-4 bg-white border border-surface-container"
                        ></textarea>
                      )}

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={async () => {
                            await api().put(`/admin/cms/${block.id}`, block);
                            fetchData();
                            alert('Contenu mis à jour !');
                          }}
                          className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline"
                        >
                          Enregistrer ce bloc
                        </button>
                      </div>
                    </div>
                  )
                })}

              {/* Sticky Global Save for CMS pages */}
              <div className="sticky bottom-8 left-0 right-0 z-30 flex justify-center mt-12">
                <button
                  onClick={handleSaveAllCms}
                  disabled={loading}
                  className="bg-primary text-white px-10 py-5 rounded-3xl text-sm font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-4 border border-white/20"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={20} />
                  )}
                  Enregistrer toutes les modifications de la page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MEDIA LIBRARY VIEW ── */}
        {view === 'media' && (
          <div className="flex-1 overflow-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h3 className="display-font text-3xl text-primary">Médiathèque</h3>
                <p className="text-on-surface-variant font-light mt-1">Gérez vos médias. Modifiez les textes alternatifs (alt) pour le SEO et l'accessibilité.</p>
              </div>
              <label className="bg-secondary text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer shadow-md flex items-center gap-2">
                <Upload size={16} />
                Uploader des fichiers
                <input type="file" multiple className="hidden" onChange={handleMediaUpload} />
              </label>
            </div>

            {mediaLoading ? (
              <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaList.map((file, i) => (
                    <div key={file.id || i} className="group bg-surface rounded-2xl border border-surface-container-low overflow-hidden hover:shadow-xl transition-all">
                      <div className="aspect-video bg-surface-container-lowest flex items-center justify-center overflow-hidden">
                        {file.type === 'pdf' ? (
                          <FileText size={48} className="text-primary/40" />
                        ) : (
                          <img src={getAssetUrl(file?.url || file)} alt={file.alt || file.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-bold text-on-surface truncate">{file.name}</p>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9px] text-outline opacity-60 uppercase truncate flex-1">{file.type} • {(file.size / 1024).toFixed(0)} KB</span>
                        </div>

                        {/* Alt Text */}
                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-widest text-primary/60 block mb-1">Texte alternatif (alt)</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              defaultValue={file.alt || ''}
                              className="w-full minimal-input p-2 bg-white text-xs border border-surface-container"
                              placeholder="Description pour le SEO..."
                              onBlur={async (e) => {
                                const val = e.target.value.trim();
                                if (val !== (file.alt || '')) {
                                  try {
                                    await api().put(`/admin/media/${file.id}`, { ...file, alt: val });
                                    fetchMedia();
                                  } catch (err) { console.error(err); }
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-widest text-primary/60 block mb-1">Titre</label>
                          <input
                            type="text"
                            defaultValue={file.title || ''}
                            className="w-full minimal-input p-2 bg-white text-xs border border-surface-container"
                            placeholder="Titre de l'image..."
                            onBlur={async (e) => {
                              const val = e.target.value.trim();
                              if (val !== (file.title || '')) {
                                try {
                                  await api().put(`/admin/media/${file.id}`, { ...file, title: val });
                                  fetchMedia();
                                } catch (err) { console.error(err); }
                              }
                            }}
                          />
                        </div>

                        {/* Caption */}
                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-widest text-primary/60 block mb-1">Légende</label>
                          <input
                            type="text"
                            defaultValue={file.caption || ''}
                            className="w-full minimal-input p-2 bg-white text-xs border border-surface-container"
                            placeholder="Légende affichée sous l'image..."
                            onBlur={async (e) => {
                              const val = e.target.value.trim();
                              if (val !== (file.caption || '')) {
                                try {
                                  await api().put(`/admin/media/${file.id}`, { ...file, caption: val });
                                  fetchMedia();
                                } catch (err) { console.error(err); }
                              }
                            }}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(getAssetUrl(file?.url || file));
                              setCopiedId(file.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className={`flex-1 text-[9px] font-bold uppercase tracking-widest py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${copiedId === file.id ? 'bg-primary text-white' : 'bg-surface-container-low text-primary hover:bg-primary/5'}`}
                          >
                            {copiedId === file.id ? (
                              <><CheckCircle size={10} /> Copié !</>
                            ) : (
                              <><ExternalLink size={10} /> Copier le lien</>
                            )}
                          </button>
                          <button
                            onClick={() => handleMediaDelete(file.path || file.file_path)}
                            className="bg-error/10 text-error hover:bg-error hover:text-white p-2 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
                {mediaList.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-surface rounded-3xl border-2 border-dashed border-outline/10">
                    <ImageIcon size={40} className="mx-auto text-outline/20 mb-4" />
                    <p className="text-outline italic text-sm">Aucun fichier dans la médiathèque.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* ACCOUNT VIEW */}
        {view === 'account' && (
          <div className="max-w-xl mx-auto py-10">
            <h2 className="display-font text-3xl text-primary mb-8">Paramètres du Compte</h2>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const data = {};
                  if (formData.new_email) data.email = formData.new_email;
                  if (formData.new_password) {
                    if (formData.new_password !== formData.confirm_password) {
                      throw new Error("Les mots de passe ne correspondent pas");
                    }
                    data.password = formData.new_password;
                    data.password_confirmation = formData.confirm_password;
                  }
                  await api().post('/admin/update-account', data);
                  alert("Compte mis à jour avec succès ! Vous allez être déconnecté pour utiliser vos nouveaux identifiants.");
                  handleLogout();
                } catch (err) {
                  alert(err.response?.data?.message || err.message);
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-6 bg-surface p-8 rounded-3xl border border-surface-container-low shadow-sm"
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Nouvel Email (Laisser vide pour ne pas changer)</label>
                <input 
                  type="email" 
                  value={formData.new_email || ''} 
                  onChange={e => updateField('new_email', e.target.value)}
                  className="w-full minimal-input p-4 bg-surface-container-lowest"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Nouveau Mot de Passe</label>
                <input 
                  type="password" 
                  value={formData.new_password || ''} 
                  onChange={e => updateField('new_password', e.target.value)}
                  className="w-full minimal-input p-4 bg-surface-container-lowest"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Confirmer le Mot de Passe</label>
                <input 
                  type="password" 
                  value={formData.confirm_password || ''} 
                  onChange={e => updateField('confirm_password', e.target.value)}
                  className="w-full minimal-input p-4 bg-surface-container-lowest"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour le compte'}
              </button>
            </form>
            <div className="mt-8 p-6 bg-secondary/10 border border-secondary/20 rounded-2xl">
              <p className="text-xs text-secondary leading-relaxed">
                <span className="font-bold uppercase tracking-tighter block mb-1">Note de sécurité</span>
                Madame Céline, vous pouvez changer vos identifiants ici. Une fois modifiés, vos anciens accès ne fonctionneront plus. Gardez bien ces informations secrètes.
              </p>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-xl space-y-8">
            <div className="bg-surface p-8 rounded-3xl border border-surface-container-low shadow-sm">
              <h4 className="display-font text-2xl text-primary mb-6">Contact & Liens</h4>
              <div className="space-y-6">
                {[
                  { key: 'whatsapp_number', label: 'Numéro WhatsApp (avec code pays)', placeholder: '212...' },
                  { key: 'reservation_phone', label: 'Téléphone Réservation', placeholder: '+212...' },
                  { key: 'contact_email', label: 'Email de Contact', type: 'email' },
                  { key: 'contact_address', label: 'Adresse physique' },
                  { key: 'instagram_url', label: 'Lien Instagram' },
                  { key: 'tiktok_url', label: 'Lien TikTok' },
                  { key: 'facebook_url', label: 'Lien Facebook' },
                  { key: 'google_review_url', label: 'Lien Google Reviews' },
                  { key: 'footer_brand_title', label: 'Titre Marque Footer' },
                  { key: 'footer_description', label: 'Description courte Footer', type: 'textarea' },
                ].map(s => (
                  <div key={s.key}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{s.label}</label>
                    {s.type === 'textarea' ? (
                      <textarea
                        value={siteSettings[s.key]?.value || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, [s.key]: { ...(siteSettings[s.key] || {}), value: e.target.value } })}
                        className="w-full minimal-input p-4 bg-surface-container-lowest resize-none" rows="3"
                      ></textarea>
                    ) : (
                      <input
                        type="text"
                        value={siteSettings[s.key]?.value || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, [s.key]: { ...(siteSettings[s.key] || {}), value: e.target.value } })}
                        className="w-full minimal-input p-4 bg-surface-container-lowest"
                      />
                    )}
                  </div>
                ))}

                {/* Dynamic Footer Links List */}
                <div className="pt-8 mt-8 border-t border-surface-container-low">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block">Liens d'Information (Footer)</label>
                      <p className="text-[9px] text-on-surface-variant opacity-60 uppercase mt-1">Gérez les liens de bas de page</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        let current = siteSettings.footer_info_links?.value;
                        if (typeof current === 'string') {
                          try { current = JSON.parse(current); } catch (e) { current = []; }
                        }
                        if (!Array.isArray(current)) current = [];

                        setSiteSettings({
                          ...siteSettings,
                          footer_info_links: {
                            ...(siteSettings.footer_info_links || {}),
                            value: [...current, { label: '', url: '' }]
                          }
                        });
                      }}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> Ajouter un lien
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const val = siteSettings.footer_info_links?.value;
                      if (Array.isArray(val)) return val;
                      try {
                        return JSON.parse(val || '[]');
                      } catch (e) { return []; }
                    })().map((link, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-surface rounded-2xl border border-surface-container-low shadow-sm">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            placeholder="Libellé (ex: Politique de confidentialité)"
                            value={link.label}
                            onChange={e => {
                              let current = siteSettings.footer_info_links?.value;
                              if (typeof current === 'string') {
                                try { current = JSON.parse(current); } catch (e) { current = []; }
                              }
                              if (!Array.isArray(current)) current = [];

                              if (current[idx]) {
                                current[idx].label = e.target.value;
                                setSiteSettings({
                                  ...siteSettings,
                                  footer_info_links: { ...(siteSettings.footer_info_links || {}), value: current }
                                });
                              }
                            }}
                            className="w-full minimal-input p-3 bg-white text-xs font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Lien (ex: /privacy)"
                            value={link.url}
                            onChange={e => {
                              let current = siteSettings.footer_info_links?.value;
                              if (typeof current === 'string') {
                                try { current = JSON.parse(current); } catch (e) { current = []; }
                              }
                              if (!Array.isArray(current)) current = [];

                              if (current[idx]) {
                                current[idx].url = e.target.value;
                                setSiteSettings({
                                  ...siteSettings,
                                  footer_info_links: { ...(siteSettings.footer_info_links || {}), value: current }
                                });
                              }
                            }}
                            className="w-full minimal-input p-3 bg-white text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            let current = siteSettings.footer_info_links?.value;
                            if (typeof current === 'string') {
                              try { current = JSON.parse(current); } catch (e) { current = []; }
                            }
                            if (!Array.isArray(current)) current = [];

                            const next = current.filter((_, i) => i !== idx);
                            setSiteSettings({
                              ...siteSettings,
                              footer_info_links: { ...(siteSettings.footer_info_links || {}), value: next }
                            });
                          }}
                          className="p-3 text-error hover:bg-error-container rounded-xl transition-colors self-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="bg-error/10 border border-error/20 text-error p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3">
                    <X size={16} /> {formError}
                  </div>
                )}

                {view === 'settings' && !formError && !isSubmitting && !loading && (
                  <div id="settings-success" className="hidden bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3 animate-fade-in">
                    <CheckCircle size={16} /> Vos réglages ont été enregistrés avec succès !
                  </div>
                )}

                <button
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e).then(() => {
                      if (view === 'settings') {
                        const el = document.getElementById('settings-success');
                        if (el) {
                          el.classList.remove('hidden');
                          setTimeout(() => el.classList.add('hidden'), 5000);
                        }
                      }
                    });
                  }}
                  className={`w-full bg-primary text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl transition-all mt-10 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:translate-y-[-2px] hover:shadow-2xl active:scale-[0.98]'}`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer tous les réglages'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {['catalog_activities', 'catalog_excursions', 'categories', 'blog'].includes(view) && (
          <div className="space-y-3">
            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-pulse w-10 h-10 bg-primary/20 rounded-full" />
              </div>
            )}
            {!loading && items.map(item => (
              <div key={item.id} className="bg-surface p-6 rounded-2xl border border-surface-container-low flex justify-between items-start gap-6 group hover:border-primary/20 transition-colors">
                <div className="flex gap-6 items-start flex-1 min-w-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container flex items-center justify-center">
                    {(item.images || item.image) ? (
                      <img
                        src={view === 'categories' || view === 'blog'
                          ? getAssetUrl(item.image?.url || item.image)
                          : getAssetUrl(item.images?.[0]?.url || item.images?.[0] || item.images?.[1]?.url || item.images?.[1])}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <ImageIcon size={24} className="text-on-surface-variant opacity-50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="display-font text-2xl text-on-surface mb-2 truncate">
                      {item.title || item.name}
                    </h4>

                    {view === 'blog' && (
                      <p className="text-on-surface-variant text-sm mb-3 font-light truncate">{item.excerpt}</p>
                    )}

                    {view.startsWith('catalog_') && (
                      <p className="text-primary font-bold text-sm mb-3">
                        {item.price_from || 0}€ <span className="text-[10px] uppercase font-normal tracking-widest text-on-surface-variant">/ par pers.</span>
                      </p>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${item.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      {item.status || 'draft'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={
                      view === 'blog' ? `/blog/${item.slug}` :
                        view === 'catalog_excursions' ? `/excursions/${item.slug}` :
                          `/activities/${item.category_slug || 'all'}/${item.slug}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                    title="Voir sur le site"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button onClick={() => handleEdit(item)} className="p-3 text-secondary hover:bg-secondary/10 rounded-xl transition-colors">
                    <Settings size={18} />
                  </button>
                  <button onClick={() => requestDelete(item.id, view.startsWith('catalog_') ? 'activities' : view)} className="p-3 text-error hover:bg-error-container rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {!loading && items.length === 0 && <p className="text-on-surface-variant italic">Aucun élément trouvé.</p>}
          </div>
        )}
      </div>

      {/* ── CRUD MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl p-10 sand-shadow border border-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <h2 className="display-font text-3xl text-primary italic">
                {editingItem ? 'Modifier' : 'Ajouter'} {
                  view === 'activities' ? 'une activité' :
                    view === 'categories' ? 'une catégorie' :
                      view === 'blog' ? 'un article de blog' :
                        'le contenu'
                }
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface p-2 rounded-xl hover:bg-surface-container-low transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* --- CMS TYPE FORM --- */}
              {view.startsWith('cms_') && (
                <div className="space-y-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-outline">Clé : {formData.slug}</p>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Contenu</label>
                    {formData.type === 'json' ? (
                      <textarea
                        rows="8"
                        value={typeof formData.content === 'string' ? formData.content : JSON.stringify(formData.content, null, 2)}
                        onChange={e => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            updateField('content', parsed);
                          } catch (err) {
                            updateField('content', e.target.value);
                          }
                        }}
                        className="w-full minimal-input p-4 bg-surface font-mono text-xs"
                      ></textarea>
                    ) : (
                      <textarea
                        rows="5"
                        value={formData.content || ''}
                        onChange={e => updateField('content', e.target.value)}
                        className="w-full minimal-input p-4 bg-surface"
                      ></textarea>
                    )}
                  </div>
                </div>
              )}

              {/* --- CATEGORY TYPE FORM --- */}
              {view === 'categories' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Nom de la catégorie *</label>
                    <input required value={formData.name || ''} onChange={e => updateField('name', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: Culturelles..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Titre Héro</label>
                      <input value={formData.hero_title || ''} onChange={e => updateField('hero_title', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: Activités Bien-Être à Marrakech" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Sous-titre Héro</label>
                      <input value={formData.hero_subtitle || ''} onChange={e => updateField('hero_subtitle', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: Hammams, spas d'exception..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Description Héro (paragraphe 1)</label>
                    <textarea rows="3" value={formData.hero_description || ''} onChange={e => updateField('hero_description', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Description principale de la catégorie..."></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Texte Héro Secondaire (paragraphe 2 — laisser vide pour masquer)</label>
                    <textarea rows="2" value={formData.hero_support || ''} onChange={e => updateField('hero_support', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Texte complémentaire italique... (laisser vide pour ne pas l'afficher)"></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Badges (séparés par des virgules)</label>
                    <input
                      value={badgesInput}
                      onChange={e => {
                        const val = e.target.value;
                        setBadgesInput(val);
                        const parsed = val.split(',').map(b => b.trim()).filter(Boolean);
                        updateField('badges', parsed);
                      }}
                      onBlur={() => {
                        const parsed = badgesInput.split(',').map(b => b.trim()).filter(Boolean);
                        updateField('badges', parsed);
                        setBadgesInput(parsed.join(', '));
                      }}
                      className="w-full minimal-input p-4 bg-surface"
                      placeholder="Ex: Testé par notre équipe, Réservation WhatsApp"
                    />
                    {Array.isArray(formData.badges) && formData.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.badges.map((badge, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-medium flex items-center gap-1">
                            {badge}
                            <button
                              type="button"
                              onClick={() => {
                                const next = formData.badges.filter((_, j) => j !== i);
                                updateField('badges', next);
                                setBadgesInput(next.join(', '));
                              }}
                              className="text-primary/40 hover:text-primary leading-none"
                            >×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] text-outline italic mt-1">Laissez vide pour ne pas afficher de badges.</p>
                  </div>

                  {/* ── CATEGORY PHOTO ── */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">Photo de la catégorie</label>
                    <div className="space-y-3">
                      {/* Existing image preview */}
                      {formData.image && imageFiles.length === 0 && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-surface-container-low bg-surface-container">
                          <img
                            src={getAssetUrl(formData.image?.url || formData.image)}
                            alt="Photo actuelle"
                            className="w-full h-full object-cover"
                            onError={e => { e.target.parentElement.style.display = 'none'; }}
                          />
                          <div className="absolute top-3 right-3">
                            <button
                              type="button"
                              onClick={() => { updateField('image', null); setImageFiles([]); }}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg"
                            >
                              <Trash2 size={12} /> Supprimer
                            </button>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                            Photo actuelle
                          </div>
                        </div>
                      )}

                      {/* New file preview */}
                      {imageFiles.length > 0 && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-primary/20 bg-surface-container">
                          <img
                            src={URL.createObjectURL(imageFiles[0])}
                            alt="Nouvelle photo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <button
                              type="button"
                              onClick={() => setImageFiles([])}
                              className="bg-error text-white px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg"
                            >
                              <Trash2 size={12} /> Annuler
                            </button>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-primary/80 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                            Nouvelle photo
                          </div>
                        </div>
                      )}

                      {/* Upload button */}
                      <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl text-primary/60 hover:text-primary hover:border-primary/40 transition-all cursor-pointer hover:bg-primary/5">
                        <Upload size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {formData.image || imageFiles.length > 0 ? 'Remplacer la photo' : 'Choisir une photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              setImageFiles([e.target.files[0]]);
                            }
                          }}
                        />
                      </label>
                      <p className="text-[9px] text-outline italic text-center">Format recommandé : 1200×800px, JPG ou WebP</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Ordre d'affichage</label>
                    <input type="number" value={formData.sort_order || 0} onChange={e => updateField('sort_order', e.target.value)} className="w-full minimal-input p-4 bg-surface" />
                  </div>
                </div>
              )}

              {/* --- BLOG POST TYPE FORM --- */}
              {view === 'blog' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Titre de l'article *</label>
                    <input required value={formData.title || ''} onChange={e => updateField('title', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: Les 5 meilleurs hammams..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Extrait (Excerpt)</label>
                    <textarea rows="2" value={formData.excerpt || ''} onChange={e => updateField('excerpt', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none"></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Contenu complet *</label>
                    <textarea rows="10" required value={formData.content || ''} onChange={e => updateField('content', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Texte de l'article..."></textarea>
                  </div>

                  {/* ── BLOG COVER IMAGE ── */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">Photo de Couverture</label>
                    <div className="space-y-3">
                      {/* Existing image preview */}
                      {formData.image && imageFiles.length === 0 && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-surface-container-low bg-surface-container">
                          <img
                            src={getAssetUrl(formData.image?.url || formData.image)}
                            alt="Cover actuelle"
                            className="w-full h-full object-cover"
                            onError={e => { e.target.parentElement.style.display = 'none'; }}
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => { updateField('image', null); setExistingImages([]); }}
                              className="bg-error text-white px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg"
                            >
                              <Trash2 size={12} /> Supprimer
                            </button>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                            Image actuelle
                          </div>
                        </div>
                      )}

                      {/* New file preview */}
                      {imageFiles.length > 0 && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-primary/20 bg-surface-container">
                          <img
                            src={URL.createObjectURL(imageFiles[0])}
                            alt="Nouvelle image"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <button
                              type="button"
                              onClick={() => setImageFiles([])}
                              className="bg-error text-white px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg"
                            >
                              <Trash2 size={12} /> Annuler
                            </button>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-primary/80 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                            Nouvelle image
                          </div>
                        </div>
                      )}

                      {/* Upload button */}
                      <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl text-primary/60 hover:text-primary hover:border-primary/40 transition-all cursor-pointer bg-primary/2 hover:bg-primary/5">
                        <Upload size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {formData.image || imageFiles.length > 0 ? 'Remplacer la photo' : 'Choisir une photo de couverture'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              setImageFiles([e.target.files[0]]);
                            }
                          }}
                        />
                      </label>
                      <p className="text-[9px] text-outline italic text-center">Format recommandé : 1200×630px, JPG ou WebP</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Catégorie</label>
                    <input value={formData.category || ''} onChange={e => updateField('category', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: Bien-être, Culture..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Auteur</label>
                      <input value={formData.author || ''} onChange={e => updateField('author', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: L'équipe Just Marrakech" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Temps de lecture (min)</label>
                      <input type="number" value={formData.read_time || ''} onChange={e => updateField('read_time', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: 5" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Statut de publication</label>
                    <select
                      value={formData.status || 'draft'}
                      onChange={e => updateField('status', e.target.value)}
                      className="w-full minimal-input p-4 bg-surface focus:outline-none"
                    >
                      <option value="draft">Brouillon (Non visible)</option>
                      <option value="published">Publié (Visible sur le site)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Meta Description (SEO)</label>
                    <textarea rows="2" value={formData.meta_description || ''} onChange={e => updateField('meta_description', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Description pour Google..."></textarea>
                  </div>
                </div>
              )}

              {/* --- ACTIVITY COMMON --- */}
              {view.startsWith('catalog_') && (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Titre (Français) *</label>
                    <input required value={formData.title || ''} onChange={e => updateField('title', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Nom de l'expérience..." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                        Prix de base (€) *
                      </label>
                      <input
                        type="number" required min="0" step="0.01"
                        value={formData.price_from || ''}
                        onChange={e => updateField('price_from', e.target.value)}
                        className="w-full minimal-input p-4 bg-surface"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                        {view === 'catalog_activities' ? 'Catégorie officielle' : 'Type'}
                      </label>
                      {view === 'catalog_activities' ? (
                        <select
                          value={formData.activity_category_id || ''}
                          onChange={e => updateField('activity_category_id', e.target.value)}
                          className="w-full minimal-input p-4 bg-surface focus:outline-none"
                        >
                          <option value="">Sélectionnez une catégorie...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      ) : (
                        <input
                          value={formData.type || ''}
                          onChange={e => updateField('type', e.target.value)}
                          className="w-full minimal-input p-4 bg-surface"
                          placeholder="Ex: Riad, Villa..."
                        />
                      )}
                    </div>
                  </div>

                  {/* Price type + max persons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Tarification</label>
                      <select
                        value={formData.price_type || 'person'}
                        onChange={e => updateField('price_type', e.target.value)}
                        className="w-full minimal-input p-4 bg-surface focus:outline-none"
                      >
                        <option value="person">Par personne</option>
                        <option value="group">Par groupe</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Nombre max de personnes</label>
                      <input
                        type="number" min="1"
                        value={formData.max_persons || ''}
                        onChange={e => updateField('max_persons', e.target.value)}
                        className="w-full minimal-input p-4 bg-surface"
                        placeholder="Ex: 8"
                      />
                    </div>
                  </div>

                  {view.startsWith('catalog_') && (
                    <>
                      <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <input
                          type="checkbox" id="is_featured"
                          checked={formData.featured || false}
                          onChange={e => updateField('featured', e.target.checked)}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="is_featured" className="text-xs font-bold uppercase tracking-widest text-primary cursor-pointer">Mettre en avant sur l'accueil</label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Durée</label>
                          <input value={formData.duration || ''} onChange={e => updateField('duration', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: 3h, Demi-journée..." />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Taille du groupe</label>
                          <input value={formData.group_size || ''} onChange={e => updateField('group_size', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: 1-8 personnes" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Lieu</label>
                      <input value={formData.location || ''} onChange={e => updateField('location', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Marrakech, Essaouira..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Adresse exacte (Maps)</label>
                      <input value={formData.location_address || ''} onChange={e => updateField('location_address', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="Ex: Rue Yves Saint Laurent..." />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Lien Google Maps URL</label>
                    <input value={formData.google_maps_url || ''} onChange={e => updateField('google_maps_url', e.target.value)} className="w-full minimal-input p-4 bg-surface" placeholder="https://maps.app.goo.gl/..." />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Description courte *</label>
                    <textarea rows="3" required value={formData.description || ''} onChange={e => updateField('description', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Résumé accrocheur..."></textarea>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Ce que vous allez vivre</label>
                    <textarea rows="6" value={formData.experience_details || ''} onChange={e => updateField('experience_details', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Décrivez en détail ce que le client va vivre..."></textarea>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Informations détaillées</label>
                    <textarea rows="6" value={formData.detailed_info || ''} onChange={e => updateField('detailed_info', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Détails supplémentaires, conditions, etc..."></textarea>
                  </div>

                  {view === 'catalog_excursions' && (
                    <div className="space-y-4 pt-4 border-t border-surface-container-low">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Déroulé de la journée</label>
                        <button type="button" onClick={() => {
                          const current = formData.timeline || [];
                          updateField('timeline', [...current, { time: '', title: '', description: '' }]);
                        }} className="text-[9px] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1">
                          <Plus size={12} /> Ajouter une étape
                        </button>
                      </div>
                      <div className="space-y-4">
                        {(formData.timeline || []).map((step, idx) => (
                          <div key={idx} className="p-4 bg-surface rounded-2xl border border-primary/10 space-y-3 relative group">
                            <button type="button" onClick={() => {
                              const newArr = [...formData.timeline];
                              newArr.splice(idx, 1);
                              updateField('timeline', newArr);
                            }} className="absolute top-2 right-2 text-error/60 hover:text-error transition-colors bg-white rounded-full p-1 shadow-sm">
                              <X size={14} />
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-1 block">Heure</label>
                                <input value={step.time || ''} onChange={e => {
                                  const newArr = [...formData.timeline];
                                  newArr[idx].time = e.target.value;
                                  updateField('timeline', newArr);
                                }} placeholder="Ex: 09:00" className="w-full minimal-input p-2 bg-white text-xs" />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-1 block">Titre</label>
                                <input value={step.title || ''} onChange={e => {
                                  const newArr = [...formData.timeline];
                                  newArr[idx].title = e.target.value;
                                  updateField('timeline', newArr);
                                }} placeholder="Ex: Départ de Marrakech" className="w-full minimal-input p-2 bg-white text-xs" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-1 block">Description</label>
                              <textarea rows="2" value={step.description || ''} onChange={e => {
                                const newArr = [...formData.timeline];
                                newArr[idx].description = e.target.value;
                                updateField('timeline', newArr);
                              }} placeholder="Brève description de l'étape..." className="w-full minimal-input p-2 bg-white text-xs resize-none"></textarea>
                            </div>
                          </div>
                        ))}
                        {(!formData.timeline || formData.timeline.length === 0) && (
                          <p className="text-xs text-outline/60 italic text-center py-4 bg-surface rounded-2xl border border-dashed border-primary/20">Aucune étape définie. Cliquez sur "Ajouter une étape".</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Meta Description (SEO)</label>
                    <textarea rows="2" value={formData.meta_description || ''} onChange={e => updateField('meta_description', e.target.value)} className="w-full minimal-input p-4 bg-surface resize-none" placeholder="Description pour Google (recommandé 150-160 caractères)"></textarea>
                  </div>

                  {view.startsWith('catalog_') && (
                    <div className="space-y-6 pt-4 border-t border-surface-container-low">

                      {/* Tarifs par nombre de personnes (Excursions) */}
                      {view === 'catalog_excursions' ? (
                        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">Tarifs par personne (€)</label>
                          <p className="text-[9px] text-on-surface-variant uppercase mb-4 opacity-70">Définissez le tarif pour un seul participant selon la taille du groupe</p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(num => (
                              <div key={num} className="space-y-1">
                                <label className="text-[9px] font-bold text-outline uppercase">{num} pers.</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Prix / pers"
                                  value={formData.pricing_details?.[num] || ''}
                                  onChange={e => {
                                    const current = formData.pricing_details || {};
                                    updateField('pricing_details', { ...current, [num]: e.target.value });
                                  }}
                                  className="w-full minimal-input p-3 bg-white text-xs"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="mt-4 text-[9px] italic text-outline opacity-60">Laissez vide si le nombre n'est pas applicable.</p>
                        </div>
                      ) : (
                        /* Formulas / Pricing Variants (Activités) */
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Formules / Options</label>
                            <button type="button" onClick={() => {
                              const current = formData.formulas || [];
                              updateField('formulas', [...current, { title: '', price: '', details: '', includes_text: '' }]);
                            }} className="text-[9px] font-bold uppercase tracking-widest bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg border border-secondary/20">+ Ajouter Formule</button>
                          </div>
                          <div className="space-y-3">
                            {(formData.formulas || []).map((f, idx) => {
                              const incText = f.includes_text !== undefined ? f.includes_text : (f.includes ? f.includes.join('\n') : '');
                              return (
                                <div key={idx} className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-xl border border-surface-container-low">
                                  <div className="flex gap-2">
                                    <input value={f.title || f.name || ''} onChange={e => {
                                      const next = [...formData.formulas];
                                      next[idx].title = e.target.value;
                                      updateField('formulas', next);
                                    }} className="flex-1 minimal-input p-2 bg-transparent text-sm font-bold" placeholder="Titre (ex: Rituel Prive Signature)" />
                                    <input type="text" value={f.price || ''} onChange={e => {
                                      const next = [...formData.formulas];
                                      next[idx].price = e.target.value;
                                      updateField('formulas', next);
                                    }} className="w-40 minimal-input p-2 bg-transparent text-sm" placeholder="Prix (ex: A partir de 60€)" />
                                    {view === 'catalog_excursions' && (
                                      <select
                                        value={f.price_type || 'person'}
                                        onChange={e => {
                                          const next = [...formData.formulas];
                                          next[idx].price_type = e.target.value;
                                          updateField('formulas', next);
                                        }}
                                        className="w-32 bg-transparent text-[9px] font-bold border-none focus:ring-0 uppercase tracking-widest text-primary"
                                      >
                                        <option value="person">Par pers.</option>
                                        <option value="group">Le groupe</option>
                                      </select>
                                    )}
                                    <button type="button" onClick={() => {
                                      const next = formData.formulas.filter((_, i) => i !== idx);
                                      updateField('formulas', next);
                                    }} className="text-outline/40 hover:text-error p-2"><Trash2 size={16} /></button>
                                  </div>
                                  <input value={f.details || ''} onChange={e => {
                                    const next = [...formData.formulas];
                                    next[idx].details = e.target.value;
                                    updateField('formulas', next);
                                  }} className="w-full minimal-input p-2 bg-transparent text-xs" placeholder="Details (ex: 1h30 • Prive • Gueliz)" />
                                  <textarea rows="3" value={incText} onChange={e => {
                                    const next = [...formData.formulas];
                                    next[idx].includes_text = e.target.value;
                                    updateField('formulas', next);
                                  }} className="w-full minimal-input p-2 bg-transparent text-xs resize-none" placeholder="Inclus (1 par ligne)&#10;Hammam purifiant&#10;Gommage au savon noir"></textarea>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* FAQ */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-primary">FAQ</label>
                          <button type="button" onClick={() => {
                            const current = formData.faq || [];
                            updateField('faq', [...current, { question: '', answer: '' }]);
                          }} className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">+ Ajouter FAQ</button>
                        </div>
                        <div className="space-y-3">
                          {(formData.faq || []).map((q, idx) => (
                            <div key={idx} className="space-y-2 bg-surface-container p-4 rounded-xl">
                              <input value={q.question} onChange={e => {
                                const next = [...formData.faq];
                                next[idx].question = e.target.value;
                                updateField('faq', next);
                              }} className="w-full minimal-input p-2 bg-white text-sm font-bold" placeholder="Question..." />
                              <textarea rows="2" value={q.answer} onChange={e => {
                                const next = [...formData.faq];
                                next[idx].answer = e.target.value;
                                updateField('faq', next);
                              }} className="w-full minimal-input p-2 bg-white text-sm" placeholder="Réponse..."></textarea>
                              <button type="button" onClick={() => {
                                const next = formData.faq.filter((_, i) => i !== idx);
                                updateField('faq', next);
                              }} className="text-error text-[9px] uppercase font-bold">Supprimer cette question</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Practical Info Points */}
                      <div>
                        <div className="flex justify-between items-center mb-4 text-secondary">
                          <label className="text-[10px] font-bold uppercase tracking-widest">Infos Pratiques (Points)</label>
                          <button type="button" onClick={() => {
                            const current = formData.practical_info_points || [];
                            updateField('practical_info_points', [...current, '']);
                          }} className="text-[9px] font-bold uppercase tracking-widest bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg border border-secondary/20">+ Ajouter Info</button>
                        </div>
                        <div className="space-y-2">
                          {(formData.practical_info_points || []).map((info, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input value={info} onChange={e => {
                                const next = [...formData.practical_info_points];
                                next[idx] = e.target.value;
                                updateField('practical_info_points', next);
                              }} className="flex-1 minimal-input p-2 bg-white text-sm" placeholder="Ex: Apporter une écharpe..." />
                              <button type="button" onClick={() => {
                                const next = formData.practical_info_points.filter((_, i) => i !== idx);
                                updateField('practical_info_points', next);
                              }} className="text-outline/40 hover:text-error p-2"><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Image Gallery Management */}
              {['activities', 'catalog_activities', 'catalog_excursions', 'accommodations'].includes(view) && (
                <div className="bg-surface p-6 rounded-2xl border border-dashed border-outline-variant/30">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary block">Gestion de la Galerie Photos</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setMediaPickerConfig({
                          multi: true,
                          onSelect: (selectedMedia) => {
                            setExistingImages([...existingImages, ...selectedMedia]);
                          }
                        });
                        setShowMediaPicker(true);
                      }}
                      className="text-[9px] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} /> Médiathèque
                    </button>
                  </div>

                  {/* Existing Images with Metadata Editor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {existingImages.map((img, idx) => {
                      const url = typeof img === 'string' ? img : img.url;
                      const alt = typeof img === 'object' ? img.alt : '';
                      const title = typeof img === 'object' ? img.title : '';
                      const caption = typeof img === 'object' ? img.caption : '';
                      
                      return (
                        <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-surface-container-low shadow-sm flex flex-col">
                          <div className="relative aspect-video group">
                            <img src={getAssetUrl(url)} className="w-full h-full object-cover" alt={alt} />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all shadow-lg z-30"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="p-3 space-y-2">
                            <input 
                              type="text" 
                              placeholder="Alt text (SEO)" 
                              className="w-full text-[10px] p-2 bg-surface rounded-lg border-none focus:ring-1 focus:ring-primary/20"
                              value={alt}
                              onChange={e => {
                                const next = [...existingImages];
                                if (typeof next[idx] === 'string') next[idx] = { url: next[idx], alt: e.target.value, title: '', caption: '' };
                                else next[idx].alt = e.target.value;
                                setExistingImages(next);
                              }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                placeholder="Titre" 
                                className="w-full text-[9px] p-2 bg-surface rounded-lg border-none focus:ring-1 focus:ring-primary/20"
                                value={title}
                                onChange={e => {
                                  const next = [...existingImages];
                                  if (typeof next[idx] === 'string') next[idx] = { url: next[idx], alt: '', title: e.target.value, caption: '' };
                                  else next[idx].title = e.target.value;
                                  setExistingImages(next);
                                }}
                              />
                              <input 
                                type="text" 
                                placeholder="Légende" 
                                className="w-full text-[9px] p-2 bg-surface rounded-lg border-none focus:ring-1 focus:ring-primary/20"
                                value={caption}
                                onChange={e => {
                                  const next = [...existingImages];
                                  if (typeof next[idx] === 'string') next[idx] = { url: next[idx], alt: '', title: '', caption: e.target.value };
                                  else next[idx].caption = e.target.value;
                                  setExistingImages(next);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* New Uploads */}
                    {imageFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-video group rounded-2xl overflow-hidden border border-secondary/30 bg-secondary/5 shadow-sm">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-70" alt="" />
                        <button
                          type="button"
                          onClick={() => removeImageFile(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all shadow-lg z-30"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] bg-secondary text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">Nouveau</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="file" multiple accept="image/*"
                      onChange={handleFilesChange}
                      className="hidden" id="imgs-upload"
                    />
                    <label
                      htmlFor="imgs-upload"
                      className="flex-1 text-center py-4 bg-primary/5 text-primary border border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors font-bold text-[10px] uppercase tracking-widest"
                    >
                      {view === 'categories' ? '+ Photo de couverture' : '+ Importer de nouvelles photos'}
                    </label>
                  </div>
                </div>
              )}

              {/* Dynamic Lists (Included / Not Included) */}
              {view.startsWith('catalog_') && (
                <div className="space-y-6 pt-4 border-t border-surface-container-low">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Ce qui est inclus</label>
                      <button type="button" onClick={() => addListItem('included')} className="text-[9px] font-bold uppercase tracking-widest bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg border border-secondary/20 hover:bg-secondary/20">+ Ajouter</button>
                    </div>
                    <div className="space-y-2">
                      {includedList.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input value={item} onChange={e => updateListItem('included', idx, e.target.value)} className="flex-1 minimal-input p-3 bg-surface text-sm" placeholder="Ex: Transport A/R..." />
                          <button type="button" onClick={() => removeListItem('included', idx)} className="text-outline/40 hover:text-error transition-colors p-3"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4 text-outline">
                      <label className="text-[10px] font-bold uppercase tracking-widest">Ce qui n'est pas inclus</label>
                      <button type="button" onClick={() => addListItem('not_included')} className="text-[9px] font-bold uppercase tracking-widest bg-surface-container-highest text-outline px-3 py-1.5 rounded-lg border border-outline/20 hover:bg-surface-container-high">+ Ajouter</button>
                    </div>
                    <div className="space-y-2">
                      {notIncludedList.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input value={item} onChange={e => updateListItem('not_included', idx, e.target.value)} className="flex-1 minimal-input p-3 bg-surface text-sm opacity-70" placeholder="Ex: Boissons..." />
                          <button type="button" onClick={() => removeListItem('not_included', idx)} className="text-outline/40 hover:text-error transition-colors p-3"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              {['catalog_activities', 'catalog_excursions'].includes(view) && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Statut</label>
                  <select value={formData.status || 'published'} onChange={e => updateField('status', e.target.value)} className="w-full minimal-input p-4 bg-surface focus:ring-1 focus:ring-primary/20 outline-none">
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              )}

              <p className="text-[9px] text-outline italic opacity-70">
                * Les traductions EN, AR, ES seront générées automatiquement à l'enregistrement.
              </p>

              {formError && (
                <p className="whitespace-pre-line text-error text-sm bg-error-container/30 px-4 py-3 rounded-xl border border-error/20">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Opération en cours...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => setShowModal(false)} className="px-8 bg-surface-container-high text-outline font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-surface-container-highest transition-colors disabled:opacity-50">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-3xl p-8 sand-shadow border border-error/20 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="display-font text-2xl text-on-surface mb-2">Supression</h3>
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-3 bg-surface-container-high text-outline rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors">
                Annuler
              </button>
              <button onClick={confirmDelete} style={{ backgroundColor: '#c0392b', color: '#fff' }} className="flex-1 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md flex justify-center items-center gap-2">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MEDIA PICKER ── */}
      <MediaPicker 
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        multi={mediaPickerConfig.multi}
        onSelect={mediaPickerConfig.onSelect}
        api={api}
      />
    </div>
  );
}
