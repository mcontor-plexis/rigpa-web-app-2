import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import DzogchenTermsMainContent from './components/DzogchenTermsMainContent';

type Message = {
  sender: 'user' | 'assistant';
  content: string;
};

const App = () => {
  // Contemporary Masters modal and info state
  const [showContemporaryMastersModal, setShowContemporaryMastersModal] = useState(false);
  const [showContemporaryInfo, setShowContemporaryInfo] = useState<number | null>(null);
  // Check if API key is available
  const hasApiKey = Boolean(process.env.REACT_APP_OPENAI_API_KEY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showLineageMastersModal, setShowLineageMastersModal] = useState(false);
  const [showTibetanAlphabetModal, setShowTibetanAlphabetModal] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [fullScreenImageSrc, setFullScreenImageSrc] = useState('');
  const [fullScreenImageTitle, setFullScreenImageTitle] = useState('');
  const [showDeityInfo, setShowDeityInfo] = useState(false);
  const [currentDeityInfo, setCurrentDeityInfo] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorZoom, setEditorZoom] = useState(100); // Zoom level in percentage
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Fix editor direction on content change
  useEffect(() => {
    if (activeMenu === 'help' && editorRef.current) {
      const editor = editorRef.current;
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'left';
      
      // Always restore saved content when switching to editor
      if (editorContent && editorContent.trim() !== '') {
        // Only update if content is different and we're not actively typing
        const selection = window.getSelection();
        const isTyping = selection && selection.rangeCount > 0 && 
                         selection.focusNode && editor.contains(selection.focusNode);
        if (!isTyping && editor.innerHTML !== editorContent) {
          editor.innerHTML = editorContent;
        }
      } else if (!editor.innerHTML || editor.innerHTML.trim() === '' || editor.innerHTML === '<p><br></p>') {
        // Only initialize with empty content if there's no saved content
        editor.innerHTML = '<p><br></p>';
      }
    }
  }, [activeMenu, editorContent]);

  // Auto-save editor content
  useEffect(() => {
    if (editorContent) {
      localStorage.setItem('editorContent', editorContent);
    }
  }, [editorContent]);

  // Load saved editor content on startup
  useEffect(() => {
    const saved = localStorage.getItem('editorContent');
    if (saved && !editorContent) {
      setEditorContent(saved);
    }
  }, []);

  // Load saved chat messages on startup
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages && messages.length === 0) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading saved chat messages:', error);
      }
    }
  }, []);

  // Auto-save chat messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save editor content before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorRef.current && activeMenu === 'help') {
        const currentContent = editorRef.current.innerHTML;
        localStorage.setItem('editorContent', currentContent);
      }
      // Also save chat messages before unload
      if (messages.length > 0) {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeMenu, messages]);

  const handleRigpaAIClick = () => {
    setActiveMenu('chat'); // Show chat in main content instead of modal
  };

  const handleMenuClick = (menuId: string) => {
    // Save current editor content before switching menus
    if (activeMenu === 'help' && editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      setEditorContent(currentContent);
      localStorage.setItem('editorContent', currentContent);
    }

    if (menuId === 'help') {
      setActiveMenu('help'); // Show editor in main content
    } else if (menuId === 'dzogchen-terms') {
      setActiveMenu('dzogchen-terms'); // Show Dzogchen Terms in main content
    } else if (menuId === 'chat') {
      setActiveMenu('chat'); // Show chat in main content
    } else {
      setActiveMenu(activeMenu === menuId ? null : menuId);
    }
  };

  const handleSubMenuClick = (parentLabel: string, subItem: string) => {
    if (parentLabel === 'Galleries' && subItem === 'Deity Collection') {
      setShowGalleryModal(true);
    } else if (parentLabel === 'Galleries' && subItem === 'Lineage Masters') {
      setShowLineageMastersModal(true);
    } else if (parentLabel === 'Galleries' && subItem === 'Contemporary Masters') {
      setShowContemporaryMastersModal(true);
    } else if (parentLabel === 'Tibetan Grammer' && subItem === 'Tibetan Alphabet') {
      setShowTibetanAlphabetModal(true);
    }
  };

  const closeAllModals = () => {
    setShowGalleryModal(false);
    setShowLineageMastersModal(false);
    setShowTibetanAlphabetModal(false);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Always update the state with current content to ensure persistence
      setEditorContent(content);
    }
  };

  // Editor zoom functions
  const zoomEditorIn = () => {
    setEditorZoom(prev => Math.min(prev + 10, 200)); // Max 200%
  };

  const zoomEditorOut = () => {
    setEditorZoom(prev => Math.max(prev - 10, 50)); // Min 50%
  };

  const resetEditorZoom = () => {
    setEditorZoom(100);
  };

  // Handle keyboard shortcuts for editor zoom
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '=':
        case '+':
          e.preventDefault();
          zoomEditorIn();
          break;
        case '-':
          e.preventDefault();
          zoomEditorOut();
          break;
        case '0':
          e.preventDefault();
          resetEditorZoom();
          break;
      }
    }
  };

  // Handle mouse wheel zoom for editor
  const handleEditorWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomEditorIn();
      } else {
        zoomEditorOut();
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Check if API key is available
    if (!hasApiKey) {
      const errorMessage: Message = { 
        sender: 'assistant', 
        content: 'OpenAI API functionality is currently disabled for this public demo. To enable AI chat, please set up your own OpenAI API key in the environment variables.' 
      };
      setMessages(prev => [...prev, { sender: 'user', content: input }, errorMessage]);
      setInput('');
      return;
    }

    const userMessage: Message = { sender: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          //model: 'gpt-3.5-turbo',
          model: 'gpt-4o',
          messages: [{ role: 'user', content: input }],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        sender: 'assistant',
        content: data.choices[0].message.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        sender: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const openFullScreenImage = (src: string, title: string, info?: any) => {
    setFullScreenImageSrc(src);
    setFullScreenImageTitle(title);
    setCurrentDeityInfo(info);
    setShowFullScreenImage(true);
  };

  const closeFullScreenImage = () => {
    setShowFullScreenImage(false);
    setShowDeityInfo(false);
  };

  const toggleDeityInfo = () => {
    setShowDeityInfo(!showDeityInfo);
  };

  const copyToClipboard = async (text: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
      
      // Show visual feedback
      setCopiedMessageIndex(messageIndex);
      setTimeout(() => {
        setCopiedMessageIndex(null);
      }, 2000); // Hide feedback after 2 seconds
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Text copied to clipboard (fallback)');
        
        // Show visual feedback for fallback too
        setCopiedMessageIndex(messageIndex);
        setTimeout(() => {
          setCopiedMessageIndex(null);
        }, 2000);
        
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear all chat messages?')) {
      setMessages([]);
      setCopiedMessageIndex(null);
      localStorage.removeItem('chatMessages');
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const menuItems = [
    { id: 'chat', label: 'Rigpa AI', subItems: [] },
    { id: 'dzogchen-terms', label: 'Master Dzogchen Terms', subItems: [] },
    {
      id: 'dictionary',
      label: 'Tibetan Grammer',
      subItems: ['Tibetan Alphabet']
    },
    {
      id: 'gallery',
      label: 'Galleries',
      subItems: ['Deity Collection', 'Lineage Masters', 'Contemporary Masters']
    },
    { id: 'help', label: 'Editor', subItems: [] },
  ];

  // Deity images data
  const deityImages = [
    { 
      id: 1, 
      src: `${process.env.PUBLIC_URL}/DorjeDrolo.jpg`, 
      alt: 'Deity 1', 
      title: 'Dorje Drolo',
      description: 'Dorje Drolo is a wrathful manifestation of Guru Rinpoche (Padmasambhava). This fierce form represents the power to overcome obstacles and negative forces on the spiritual path. Often depicted riding a pregnant tigress, Dorje Drolo embodies the transformative energy needed to cut through illusion and establish the dharma in difficult circumstances.'
    },
    { 
      id: 2, 
      src: `${process.env.PUBLIC_URL}/Manjushri.jpg`, 
      alt: 'Deity 2', 
      title: 'Manjushri',
      description: 'Manjushri is the Bodhisattva of Wisdom and represents the perfection of transcendent knowledge. Often depicted holding a flaming sword that cuts through ignorance and a lotus bearing the Perfection of Wisdom sutra, Manjushri embodies the sharp clarity of awakened mind that sees through all conceptual limitations to ultimate truth.'
    },
    { 
      id: 3, 
      src: `${process.env.PUBLIC_URL}/Padmasambava.jpg`, 
      alt: 'Deity 3', 
      title: 'Padmasambhava',
      description: 'Padmasambhava, also known as Guru Rinpoche, is the "Lotus-Born" master who brought Buddhism to Tibet in the 8th century. Revered as the Second Buddha, he established the Dharma in Tibet and hid countless treasure teachings (terma) to be discovered in future times. He represents the perfect union of wisdom and compassion.'
    },
    { 
      id: 4, 
      src: `${process.env.PUBLIC_URL}/Troma.jpg`, 
      alt: 'Deity 4', 
      title: 'Troma Nagmo',
      description: 'Troma Nagmo is a wrathful dakini and protector deity in the Dzogchen tradition. Known as the "Black Wrathful Mother," she represents the fierce compassion that destroys ego-grasping and obstacles to enlightenment. Her practice is considered especially powerful for cutting through the subtlest mental obscurations and revealing the nature of mind.'
    },
    { 
      id: 5, 
      src: `${process.env.PUBLIC_URL}/Vajrakilaya.jpg`, 
      alt: 'Deity 5', 
      title: 'Vajrakilaya',
      description: 'Vajrakilaya (Dorje Phurba) is a wrathful deity representing the enlightened activity of all Buddhas. Depicted with three faces and six arms holding ritual daggers (phurbas), Vajrakilaya embodies the power to eliminate obstacles, both outer and inner, that prevent spiritual realization. This practice is central to removing impediments on the path to enlightenment.'
    },
    { 
      id: 6, 
      src: `${process.env.PUBLIC_URL}/Vajrayogini.jpg`, 
      alt: 'Deity 6', 
      title: 'Vajrayogini',
      description: 'Vajrayogini is a female Buddha representing the union of wisdom and bliss. Often depicted as a dancing red figure holding a curved knife and skull cup, she embodies the transformative power of tantric practice. Vajrayogini represents the wisdom that directly perceives emptiness and the blissful energy that arises from this realization.'
    },
    { 
      id: 7, 
      src: `${process.env.PUBLIC_URL}/VajrasattvaYabYum.jpg`, 
      alt: 'Deity 7', 
      title: 'Vajrasattva Yab-Yum',
      description: 'Vajrasattva in union (Yab-Yum) represents the perfect integration of wisdom and compassion, method and wisdom. Vajrasattva is the deity of purification, whose practice cleanses negative karma and obscurations. In union form, this represents the inseparable nature of clarity and emptiness, the fundamental ground of being in Dzogchen.'
    },
    { 
      id: 8, 
      src: `${process.env.PUBLIC_URL}/PadmasambavaYabYum.jpg`, 
      alt: 'Deity 8', 
      title: 'Padmasambhava Yab-Yum',
      description: 'Padmasambhava in union with his consort represents the perfect balance of masculine and feminine principles, skillful means and wisdom. This form symbolizes the complete realization where all dualities are transcended and the practitioner embodies the perfect unity of awareness and emptiness that characterizes the Dzogchen view.'
    },
    { 
      id: 9, 
      src: `${process.env.PUBLIC_URL}/KuntunzangpoYabYum.jpg`, 
      alt: 'Deity 9', 
      title: 'Samantabhadra Yab-Yum',
      description: 'Samantabhadra (Kuntuzangpo) in union represents the primordial Buddha, the dharmakaya aspect of enlightenment. In Dzogchen, this figure symbolizes the original purity and spontaneous presence of the nature of mind. The union aspect represents the inseparable unity of awareness and emptiness, the fundamental ground from which all phenomena arise and dissolve.'
    },
    { 
      id: 10, 
      src: `${process.env.PUBLIC_URL}/PadmasambavaRainbowBody.jpg`, 
      alt: 'Deity 10', 
      title: 'Padmasambhava Rainbow Body',
      description: 'Padmasambhava manifesting the rainbow body represents the ultimate achievement in Dzogchen practice - the dissolution of the physical body into pure light at the time of death. This rainbow light body symbolizes the complete realization of the nature of mind and the perfect integration of wisdom and compassion beyond all conceptual limitations.'
    }
  ];

  // Contemporary masters data
  const contemporaryMasters = [
    {
      id: 7,
      src: `${process.env.PUBLIC_URL}/ChogyamTrungpaRinpoche.jpg`,
      alt: 'Chogyam Trungpa',
      title: 'Chogyam Trungpa',
      info: 'Chögyam Trungpa Rinpoche (1939–1987), the 11th Trungpa tulku, fled Tibet in 1959, studied at Oxford, and co-founded Scotland’s Samye Ling. After renouncing monastic vows, he moved to North America, founded Naropa University and Shambhala Training, wrote influential books, taught “crazy wisdom,” shaping Western Buddhism.'
    },
    {
      id: 4,
      src: `${process.env.PUBLIC_URL}/ChagdudRinpoche.jpg`,
      alt: 'Chagdud Rinpoche',
      title: 'Chagdud Rinpoche',
      info: 'Chagdud Tulku Rinpoche (1930–2002) was a Nyingma master and the 14th Chagdud incarnation. He fled Tibet in 1959, aided refugees in India, and moved to the United States in 1979. He founded Chagdud Gonpa Foundation, emphasized Red Tara and Vajrakilaya, established Brazil’s Khadro Ling, and wrote Lord of the Dance.'
    },
    {
      id: 5,
      src: `${process.env.PUBLIC_URL}/DudjomRinpoche.jpg`,
      alt: 'Dudjom Rinpoche',
      title: 'Dudjom Rinpoche',
      info: 'Dudjom Rinpoche (Jigdral Yeshe Dorje, 1904–1987) was a preeminent Nyingma master, tertön, and scholar. Recognized as Dudjom Lingpa’s reincarnation, he preserved and taught the Dudjom Tersar. After 1959 exile, he taught across India, Nepal, Europe, and North America, serving as Nyingma’s head in exile, and authored foundational histories of Nyingma.'
    },
    {
      id: 6,
      src: `${process.env.PUBLIC_URL}/HisHolinessPenorRinpoche.jpg`,
      alt: 'His Holiness Penor Rinpoche',
      title: 'His Holiness Penor Rinpoche',
      info: 'His Holiness Penor Rinpoche (1932–2009), the 11th throne holder of the Palyul lineage, was born in Powo, Kham. After fleeing Tibet, he founded Namdroling Monastery in South India. Supreme Head of the Nyingma school from 1993 to 2001, he was renowned for Dzogchen teachings and ordained thousands, passing in 2009.'
    },
    {
      id: 1,
      src: `${process.env.PUBLIC_URL}/GyaltrulRinpoche.jpg`,
      alt: 'Gyaltrul Rinpoche',
      title: 'Gyaltrul Rinpoche',
      info: 'Gyaltrul Rinpoche (1925–2023), a senior Nyingma Palyul master, was recognized as the tulku Sampa Künkyap. After fleeing Tibet in 1959 and years in India, he moved to the U.S., founding Tashi Choling and Orgyen Dorje Den, serving Dudjom Rinpoche’s lineage, teaching Dzogchen, and authoring Meditation, Transformation, and Dream Yoga.'
    },
    {
      id: 2,
      src: `${process.env.PUBLIC_URL}/ChatrulRinpoche.jpg`,
      alt: 'Chatrul Rinpoche',
      title: 'Chatrul Rinpoche',
      info: 'Chatral Rinpoche (Chatral Sangye Dorje, 1913–2015) was a renowned Nyingma Dzogchen master and reclusive yogi, a lineage holder of Longchen Nyingtik and Dudjom Tersar. Born in Kham, he lived mainly in Nepal and India, advocated strict vegetarianism and life release, taught widely yet avoided institutions, and passed away in Pharping.'
    },
    {
      id: 3,
      src: `${process.env.PUBLIC_URL}/YangthangRinpoche.jpg`,
      alt: 'Yangthang Rinpoche',
      title: 'Yangthang Rinpoche',
      info: 'Yangthang Rinpoche (1930–2016) was a highly revered Nyingma Palyul master from Sikkim, recognized as the reincarnation of tertön Dorje Dechen Lingpa of Dhomang Monastery. Imprisoned for twenty-two years after 1959, he was released in 1981, later teaching widely worldwide, preserving Dzogchen transmissions, and inspiring disciples until his passing in 2016.'
    },
  ];

  // Lineage masters data
  const lineageMasters = [
    { 
      id: 1, 
      src: `${process.env.PUBLIC_URL}/Longchenpa.jpeg`, 
      alt: 'Master 1', 
      title: 'Longchenpa',
      description: 'Longchen Rabjam (1308-1364) was one of the greatest scholars and realized masters of the Nyingma tradition. Known as "The Great Vast Expanse," he systematized and clarified the Dzogchen teachings in his profound works including the Seven Treasuries. His writings present the most complete and accessible exposition of the Great Perfection, emphasizing the natural state of primordial awareness.'
    },
    { 
      id: 2, 
      src: `${process.env.PUBLIC_URL}/DudjomLingpa.jpg`, 
      alt: 'Master 2', 
      title: 'Dudjom Lingpa',
      description: 'Dudjom Lingpa (1835-1904) was a great tertön (treasure revealer) and master of the Nyingma tradition. He revealed numerous important terma teachings and established retreat centers where practitioners could engage in intensive Dzogchen practice. His lineage continues today through various emanations and heart disciples who maintain his pure transmission of the Great Perfection.'
    },
    { 
      id: 3, 
      src: `${process.env.PUBLIC_URL}/TertonMigyorDorje.jpg`, 
      alt: 'Master 3', 
      title: 'Tertön Migyur Dorje',
      description: 'Chokgyur Dechen Lingpa, also known as Tertön Migyur Dorje (1829-1870), was one of the greatest treasure revealers of the 19th century. He discovered numerous important terma cycles including profound Dzogchen teachings. His revelations bridge the ancient wisdom of Padmasambhava with the needs of modern practitioners, providing clear instructions for realization.'
    },
    { 
      id: 4, 
      src: `${process.env.PUBLIC_URL}/RigdzinKunzangSherab.jpg`, 
      alt: 'Master 4', 
      title: 'Rigdzin Kunzang Sherab',
      description: 'Rigdzin Kunzang Sherab was a realized master in the tradition of the Great Perfection, known for his profound realization and clear exposition of Dzogchen teachings. Masters like him represent the unbroken lineage of wisdom transmission that maintains the purity and power of these ancient instructions for awakening to our true nature.'
    },
    { 
      id: 5, 
      src: `${process.env.PUBLIC_URL}/YesheSogyal.jpg`, 
      alt: 'Master 5', 
      title: 'Yeshe Tsogyal',
      description: 'Yeshe Tsogyal (also known as Khandro Yeshe Tsogyal) was the principal consort and spiritual partner of Guru Rinpoche. She was instrumental in receiving, preserving, and hiding many of the treasure teachings. As a fully realized dakini, she represents the wisdom aspect of enlightenment and is revered as the "Mother of all Buddhas" in the Nyingma tradition.'
    },
    {
      id: 6,
      src: `${process.env.PUBLIC_URL}/JigmeLingpa.jpg`,
      alt: 'Master 6',
      title: 'Jigme Lingpa',
      description: 'Jigme Lingpa (1730–1798) was one of the most important tertöns and masters of the Nyingma school. He revealed the Longchen Nyingthig cycle of teachings, which became the heart-essence of Dzogchen practice for countless practitioners. His life and writings embody the union of scholarship, realization, and compassionate activity.'
    }
    ,
    {
      id: 7,
      src: `${process.env.PUBLIC_URL}/Mandarava.jpg`,
      alt: 'Master 7',
      title: 'Mandarava',
      description: 'Mandarava was a renowned Indian princess and realized consort of Guru Padmasambhava. She attained the rainbow body and is revered as a wisdom dakini, embodying the qualities of realization, devotion, and the transmission of profound teachings. Her life story inspires practitioners to pursue the path of enlightenment with courage and compassion.'
    }
    ,
    {
      id: 8,
      src: `${process.env.PUBLIC_URL}/Saraha.jpg`,
      alt: 'Master 8',
      title: 'Saraha',
      description: 'Saraha was one of the earliest and most celebrated Indian Mahasiddhas, renowned for his realization of the nature of mind and his poetic songs of awakening. His teachings on spontaneous presence and direct experience laid the foundation for many later Dzogchen and Mahamudra traditions. Saraha’s life exemplifies the power of realization beyond conventional boundaries.'
    }
    ,
    {
      id: 9,
      src: `${process.env.PUBLIC_URL}/MachigLabdron.jpg`,
      alt: 'Master 9',
      title: 'Machig Labdrön',
      description: 'Machig Labdrön (1055–1149) was a renowned Tibetan yogini and the founder of the Chöd practice. Her teachings emphasize cutting through ego-clinging and fear, and her life is celebrated for its profound realization, compassion, and the transmission of unique methods for direct liberation. Machig Labdrön is revered as a wisdom dakini and a model of spiritual courage.'
    }
    ,
    {
      id: 10,
      src: `${process.env.PUBLIC_URL}/GarabDorje.jpg`,
      alt: 'Master 10',
      title: 'Garab Dorje',
      description: 'Garab Dorje (Prahevajra) is regarded as the first human teacher of Dzogchen, the Great Perfection. He received the direct transmission of the Dzogchen teachings and passed them on to his disciple Manjushrimitra. Garab Dorje’s legacy is the foundational Dzogchen instructions, emphasizing direct introduction to the nature of mind and the path of spontaneous presence.'
    }
  ];

  return (
    <div className="App">
      <div className="menu-panel">
        <div className="picture-box">
          <img 
            src={`${process.env.PUBLIC_URL}/Hung.png`} 
            alt="Profile Picture" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
          <div className="picture-placeholder" style={{ display: 'none' }}>
            📷<br />
            Image not found<br />
            <small>Place your JPG in /public folder</small>
          </div>
        </div>
        <div className="menu-items-container">
          {menuItems.map((menu) => (
            <div key={menu.id} className="menu-item">
              <button
                className={`menu-button ${activeMenu === menu.id ? 'active' : ''}`}
                onClick={() => {
                  if (menu.id === 'chat') {
                    setActiveMenu('chat');
                  } else if (menu.id === 'help') {
                    setActiveMenu('help');
                  } else if (menu.id === 'dzogchen-terms') {
                    setActiveMenu('dzogchen-terms');
                  } else {
                    handleMenuClick(menu.id);
                  }
                }}
              >
                {menu.label}
              </button>
              {activeMenu === menu.id && menu.subItems.length > 0 && (
                <div className="submenu">
                  {menu.subItems.map((subItem, index) => (
                    <button
                      key={index}
                      className="submenu-button"
                      onClick={() => handleSubMenuClick(menu.label, subItem)}
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area with Logo */}
      <div className="main-content">
        {activeMenu === 'help' ? (
          // Editor Content
          <div className="editor-container">
            <div className="editor-header">
              <h2>Rich Text Editor</h2>
              <button className="close-button" onClick={() => setActiveMenu(null)}>
                ×
              </button>
            </div>
            <div className="editor-toolbar">
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('bold')}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('italic')}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('underline')}
                title="Underline"
              >
                <u>U</u>
              </button>
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('insertUnorderedList')}
                title="Bullet List"
              >
                • List
              </button>
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('insertOrderedList')}
                title="Numbered List"
              >
                1. List
              </button>
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('justifyLeft')}
                title="Align Left"
              >
                ⬅
              </button>
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('justifyCenter')}
                title="Align Center"
              >
                ↔
              </button>
              <button
                className="toolbar-button"
                onClick={() => document.execCommand('justifyRight')}
                title="Align Right"
              >
                ➡
              </button>
              <button
                className="toolbar-button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const imageDataUrl = event.target?.result as string;

                        // Create an image element
                        const img = document.createElement('img');
                        img.src = imageDataUrl;
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.display = 'block';
                        img.style.margin = '10px 0';
                        img.alt = file.name;

                        // Insert the image at cursor position
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          const range = selection.getRangeAt(0);
                          range.deleteContents();
                          range.insertNode(img);

                          // Move cursor after the image
                          range.setStartAfter(img);
                          range.collapse(true);
                          selection.removeAllRanges();
                          selection.addRange(range);
                        } else if (editorRef.current) {
                          // If no selection, append to the end
                          editorRef.current.appendChild(img);
                        }

                        // Update editor content
                        if (editorRef.current) {
                          setEditorContent(editorRef.current.innerHTML);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                title="Insert Image"
              >
                🖼️ Image
              </button>
              <button
                className="toolbar-button"
                onClick={() => {
                  window.open('https://nitarthadigitallibrary.org/dictionary/search', '_blank');
                }}
                title="Nitartha Dictionary"
              >
                📚 Nitartha Dictionary
              </button>
              <button
                className="toolbar-button"
                onClick={() => {
                  window.open('https://rywiki.tsadra.org/index.php/Main_Page', '_blank');
                }}
                title="Rangjung Yeshe"
              >
                📖 Rangjung Yeshe
              </button>
              <button
                className="toolbar-button zoom-button"
                onClick={zoomEditorOut}
                title="Zoom Out (Ctrl + -)"
              >
                🔍➖
              </button>
              <span className="zoom-level">{editorZoom}%</span>
              <button
                className="toolbar-button zoom-button"
                onClick={zoomEditorIn}
                title="Zoom In (Ctrl + +)"
              >
                🔍➕
              </button>
              <button
                className="toolbar-button zoom-button"
                onClick={resetEditorZoom}
                title="Reset Zoom (Ctrl + 0)"
              >
                🔍↻
              </button>
            </div>
            <div
              ref={editorRef}
              key="rich-text-editor"
              className="rich-text-editor"
              contentEditable={true}
              onInput={handleEditorInput}
              onKeyDown={handleEditorKeyDown}
              onWheel={handleEditorWheel}
              style={{
                direction: 'ltr',
                textAlign: 'left',
                minHeight: '400px',
                padding: '20px',
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: '#1a1a1a',
                color: '#e0e0e0',
                outline: 'none',
                fontSize: `${16 * (editorZoom / 100)}px`,
                lineHeight: '1.6',
                fontFamily: 'Arial, sans-serif',
                transform: `scale(1)`, // Keep at 1 since we're using fontSize for zoom
                transformOrigin: 'top left',
                '--editor-zoom-scale': editorZoom / 100 // CSS custom property for image scaling
              } as React.CSSProperties}
              suppressContentEditableWarning={true}
            />
            <div className="editor-actions">
              <button
                className="editor-save-btn"
                onClick={() => {
                  const currentContent = editorRef.current?.innerHTML || '';
                  setEditorContent(currentContent);
                  localStorage.setItem('editorContent', currentContent);
                  alert('Content saved to browser storage!');
                }}
              >
                💾 Save to Browser
              </button>
              <button
                className="editor-export-btn"
                onClick={() => {
                  // Export as HTML file
                  const currentContent = editorRef.current?.innerHTML || '';
                  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .tibetan {
            font-size: 18px;
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="content tibetan">
        ${currentContent}
    </div>
</body>
</html>`;

                  const blob = new Blob([htmlDocument], {
                    type: 'text/html;charset=utf-8'
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `document_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                📄 Export HTML
              </button>
              <button
                className="editor-export-text-btn"
                onClick={() => {
                  // Export as plain text file
                  const currentContent = editorRef.current?.innerHTML || '';
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = currentContent;
                  const textContent = tempDiv.textContent || tempDiv.innerText || '';
                  const blob = new Blob([textContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `document_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                📝 Export Text
              </button>
              <button
                className="editor-import-btn"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.html,.txt,.md,image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      // Handle image files
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageDataUrl = event.target?.result as string;

                          // Create an image element
                          const img = document.createElement('img');
                          img.src = imageDataUrl;
                          img.style.maxWidth = '100%';
                          img.style.height = 'auto';
                          img.style.display = 'block';
                          img.style.margin = '10px 0';
                          img.alt = file.name;

                          // Add image to editor
                          if (editorRef.current) {
                            editorRef.current.appendChild(img);
                            setEditorContent(editorRef.current.innerHTML);
                            editorRef.current.focus();
                          }

                          alert(`Image "${file.name}" imported successfully!`);
                        };

                        reader.onerror = () => {
                          alert('Error reading image file. Please try again.');
                        };

                        reader.readAsDataURL(file);
                      } else {
                        // Handle text files
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          let finalContent: string;

                          if (file.type === 'text/html' || file.name.endsWith('.html')) {
                            finalContent = content;
                          } else {
                            // For plain text files, wrap in paragraphs
                            finalContent = content
                              .split('\n')
                              .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
                              .join('');
                          }

                          // Update both React state and DOM
                          setEditorContent(finalContent);
                          if (editorRef.current) {
                            editorRef.current.innerHTML = finalContent;
                            editorRef.current.focus();
                          }

                          alert(`File "${file.name}" imported successfully!`);
                        };

                        reader.onerror = () => {
                          alert('Error reading file. Please try again.');
                        };

                        reader.readAsText(file, 'UTF-8');
                      }
                    }
                  };
                  input.click();
                }}
              >
                📁 Import File
              </button>
              <button
                className="editor-load-btn"
                onClick={() => {
                  // Load functionality
                  const saved = localStorage.getItem('editorContent');
                  if (saved) {
                    setEditorContent(saved);
                    // Also update the DOM directly to show the content immediately
                    if (editorRef.current) {
                      editorRef.current.innerHTML = saved;
                      editorRef.current.focus();
                    }
                    alert('Content loaded from browser storage!');
                  } else {
                    alert('No saved content found in browser storage.');
                  }
                }}
              >
                📂 Load from Browser
              </button>
              <button
                className="editor-clear-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all content?')) {
                    // Clear both React state and DOM content
                    setEditorContent('');
                    if (editorRef.current) {
                      editorRef.current.innerHTML = '<p><br></p>';
                      // Focus the editor and set cursor at the beginning
                      editorRef.current.focus();
                      const range = document.createRange();
                      const selection = window.getSelection();
                      if (editorRef.current.firstChild) {
                        range.setStart(editorRef.current.firstChild, 0);
                        range.collapse(true);
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                      }
                    }
                  }
                }}
              >
                🗑️ Clear Content
              </button>
            </div>
          </div>
        ) : activeMenu === 'dzogchen-terms' ? (
          // Dzogchen Terms Content
          <div className="dzogchen-terms-main-content">
            <DzogchenTermsMainContent onClose={() => setActiveMenu(null)} />
          </div>
        ) : activeMenu === 'chat' ? (
          // Chat Content
          <div className="chat-main-content">
            <div className="chat-main-header">
              <h2>Rigpa AI Chat</h2>
              <div className="chat-header-buttons">
                <button className="clear-chat-button" onClick={clearChat}>
                  🗑️ Clear Chat
                </button>
                <button className="close-button" onClick={() => setActiveMenu(null)}>
                  ×
                </button>
              </div>
            </div>
            <div className="chat-main-container">
              <div className="chat-window" ref={chatWindowRef}>
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    <div className="message-header">
                      <strong>{message.sender === 'user' ? 'You' : 'Rigpa AI'}:</strong>
                      <button
                        className={`copy-button ${copiedMessageIndex === index ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(message.content, index)}
                        title={copiedMessageIndex === index ? 'Copied!' : 'Copy to clipboard'}
                      >
                        {copiedMessageIndex === index ? '✓' : '📋'}
                      </button>
                    </div>
                    <div className="message-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message assistant">
                    <strong>RigpaAI:</strong>
                    <span>Thinking...</span>
                  </div>
                )}
              </div>
              <div className="input-area">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}>
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Default logo content
          <div className="rigpa-logo">རིག་པ</div>
        )}
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="gallery-modal-overlay" onClick={closeAllModals}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2>Deity Collection</h2>
              <button className="close-button" onClick={closeAllModals}>×</button>
            </div>
            <div className="gallery-grid">
              {deityImages.map((image) => (
                <div key={image.id} className="gallery-item">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    onClick={() => openFullScreenImage(image.src, image.title, image)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="image-placeholder" style={{ display: 'none' }}>
                    📷<br />
                    {image.title}<br />
                    <small>Image not found</small>
                  </div>
                  <h3>{image.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lineage Masters Modal */}
      {showLineageMastersModal && (
        <div className="gallery-modal-overlay" onClick={closeAllModals}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2>Lineage Masters</h2>
              <button className="close-button" onClick={closeAllModals}>×</button>
            </div>
            <div className="gallery-grid">
              {lineageMasters.map((master) => (
                <div key={master.id} className="gallery-item">
                  <img 
                    src={master.src} 
                    alt={master.alt}
                    onClick={() => openFullScreenImage(master.src, master.title, master)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="image-placeholder" style={{ display: 'none' }}>
                    📷<br />
                    {master.title}<br />
                    <small>Image not found</small>
                  </div>
                  <h3>{master.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contemporary Masters Modal */}
      {showContemporaryMastersModal && (
        <div className="gallery-modal-overlay" onClick={closeAllModals}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2>Contemporary Masters</h2>
              <button className="close-button" onClick={() => setShowContemporaryMastersModal(false)}>×</button>
            </div>
            <div className="gallery-grid">
              {contemporaryMasters.map((master) => (
                <div key={master.id} className="gallery-item">
                  <img 
                    src={master.src} 
                    alt={master.alt}
                    onClick={() => {
                      openFullScreenImage(master.src, master.title, master);
                      setShowDeityInfo(false);
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="image-placeholder" style={{ display: 'none' }}>
                    📷<br />
                    {master.title}<br />
                    <small>Image not found</small>
                  </div>
                  <h3>{master.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tibetan Alphabet Modal */}
      {showTibetanAlphabetModal && (
        <div className="gallery-modal-overlay" onClick={closeAllModals}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2>Tibetan Alphabet</h2>
			  <button className="close-button" onClick={closeAllModals}>
                ×
              </button>
            </div>
            <div className="tibetan-alphabet-container">
              <div className="alphabet-section">
                <h3>བོད་ཡིག་གཏུབས། (Tibetan Script Letters)</h3>
                <div className="alphabet-grid">
                  <div className="letter-group">
                    <h4>Consonants (གསལ་བྱེད།)</h4>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ཀ</div>
                        <div className="letter-info">
                          <div className="wylie">ka</div>
                          <div className="sound">[ka]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཁ</div>
                        <div className="letter-info">
                          <div className="wylie">kha</div>
                          <div className="sound">[kʰa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ག</div>
                        <div className="letter-info">
                          <div className="wylie">ga</div>
                          <div className="sound">[ga]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ང</div>
                        <div className="letter-info">
                          <div className="wylie">nga</div>
                          <div className="sound">[ŋa]</div>
                        </div>
                      </div>
                    </div>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ཅ</div>
                        <div className="letter-info">
                          <div className="wylie">ca</div>
                          <div className="sound">[tʃa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཆ</div>
                        <div className="letter-info">
                          <div className="wylie">cha</div>
                          <div className="sound">[tʃʰa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཇ</div>
                        <div className="letter-info">
                          <div className="wylie">ja</div>
                          <div className="sound">[dʒa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཉ</div>
                        <div className="letter-info">
                          <div className="wylie">nya</div>
                          <div className="sound">[ɲa]</div>
                        </div>
                      </div>
                    </div>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ཏ</div>
                        <div className="letter-info">
                          <div className="wylie">ta</div>
                          <div className="sound">[ta]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཐ</div>
                        <div className="letter-info">
                          <div className="wylie">tha</div>
                          <div className="sound">[tʰa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ད</div>
                        <div className="letter-info">
                          <div className="wylie">da</div>
                          <div className="sound">[da]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ན</div>
                        <div className="letter-info">
                          <div className="wylie">na</div>
                          <div className="sound">[na]</div>
                        </div>
                      </div>
                    </div>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">པ</div>
                        <div className="letter-info">
                          <div className="wylie">pa</div>
                          <div className="sound">[pa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཕ</div>
                        <div className="letter-info">
                          <div className="wylie">pha</div>
                          <div className="sound">[pʰa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">བ</div>
                        <div className="letter-info">
                          <div className="wylie">ba</div>
                          <div className="sound">[ba]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">མ</div>
                        <div className="letter-info">
                          <div className="wylie">ma</div>
                          <div className="sound">[ma]</div>
                        </div>
                      </div>
                    </div>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ཙ</div>
                        <div className="letter-info">
                          <div className="wylie">tsa</div>
                          <div className="sound">[tsa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཚ</div>
                        <div className="letter-info">
                          <div className="wylie">tsha</div>
                          <div className="sound">[tsʰa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཛ</div>
                        <div className="letter-info">
                          <div className="wylie">dza</div>
                          <div className="sound">[dza]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཝ</div>
                        <div className="letter-info">
                          <div className="wylie">wa</div>
                          <div className="sound">[wa]</div>
                        </div>
                      </div>
                    </div>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ཞ</div>
                        <div className="letter-info">
                          <div className="wylie">zha</div>
                          <div className="sound">[ʒa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཟ</div>
                        <div className="letter-info">
                          <div className="wylie">za</div>
                          <div className="sound">[za]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">འ</div>
                        <div className="letter-info">
                          <div className="wylie">'a</div>
                          <div className="sound">[ʔa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཡ</div>
                        <div className="letter-info">
                          <div className="wylie">ya</div>
                          <div className="sound">[ja]</div>
                        </div>
                      </div>
                    </div>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ར</div>
                        <div className="letter-info">
                          <div className="wylie">ra</div>
                          <div className="sound">[ra]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ལ</div>
                        <div className="letter-info">
                          <div className="wylie">la</div>
                          <div className="sound">[la]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཤ</div>
                        <div className="letter-info">
                          <div className="wylie">sha</div>
                          <div className="sound">[ʃa]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ས</div>
                        <div className="letter-info">
                          <div className="wylie">sa</div>
                          <div className="sound">[sa]</div>
                        </div>
                      </div>
                    </div>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ཧ</div>
                        <div className="letter-info">
                          <div className="wylie">ha</div>
                          <div className="sound">[ha]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཨ</div>
                        <div className="letter-info">
                          <div className="wylie">a</div>
                          <div className="sound">[a]</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="letter-group">
                    <h4>Vowel Signs (དབྱངས་རིགས།)</h4>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">ཀི</div>
                        <div className="letter-info">
                          <div className="wylie">ki</div>
                          <div className="sound">[ki]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཀུ</div>
                        <div className="letter-info">
                          <div className="wylie">ku</div>
                          <div className="sound">[ku]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཀེ</div>
                        <div className="letter-info">
                          <div className="wylie">ke</div>
                          <div className="sound">[ke]</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཀོ</div>
                        <div className="letter-info">
                          <div className="wylie">ko</div>
                          <div className="sound">[ko]</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="letter-group">
                    <h4>Numbers (གྲངས་ཀ།)</h4>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">༠</div>
                        <div className="letter-info">
                          <div className="wylie">0</div>
                          <div className="sound">zero</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༡</div>
                        <div className="letter-info">
                          <div className="wylie">1</div>
                          <div className="sound">one</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༢</div>
                        <div className="letter-info">
                          <div className="wylie">2</div>
                          <div className="sound">two</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༣</div>
                        <div className="letter-info">
                          <div className="wylie">3</div>
                          <div className="sound">three</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༤</div>
                        <div className="letter-info">
                          <div className="wylie">4</div>
                          <div className="sound">four</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༥</div>
                        <div className="letter-info">
                          <div className="wylie">5</div>
                          <div className="sound">five</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༦</div>
                        <div className="letter-info">
                          <div className="wylie">6</div>
                          <div className="sound">six</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༧</div>
                        <div className="letter-info">
                          <div className="wylie">7</div>
                          <div className="sound">seven</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༨</div>
                        <div className="letter-info">
                          <div className="wylie">8</div>
                          <div className="sound">eight</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༩</div>
                        <div className="letter-info">
                          <div className="wylie">9</div>
                          <div className="sound">nine</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="letter-group">
                    <h4>Punctuation (ཚེག་བར།)</h4>
                    <div className="letters-row">
                      <div className="letter-card">
                        <div className="tibetan-letter">།</div>
                        <div className="letter-info">
                          <div className="wylie">|</div>
                          <div className="sound">shad</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༎</div>
                        <div className="letter-info">
                          <div className="wylie">||</div>
                          <div className="sound">double shad</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">༄</div>
                        <div className="letter-info">
                          <div className="wylie">@</div>
                          <div className="sound">head mark</div>
                        </div>
                      </div>
                      <div className="letter-card">
                        <div className="tibetan-letter">ཿ</div>
                        <div className="letter-info">
                          <div className="wylie">:</div>
                          <div className="sound">visarga</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {showFullScreenImage && (
        <div className="fullscreen-modal-overlay" onClick={closeFullScreenImage}>
          <div className="fullscreen-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-modal-header">
              <h2>{fullScreenImageTitle}</h2>
              <div className="header-controls">
                {currentDeityInfo && (
                  <button
                    className="info-button"
                    onClick={toggleDeityInfo}
                    title={`View ${deityImages.find(d => d.title === fullScreenImageTitle) ? 'deity' : 'lineage master'} information`}
                  >
                    ℹ️
                  </button>
                )}
                <button className="close-button" onClick={closeFullScreenImage}>
                  ×
                </button>
              </div>
            </div>
            
            <div className="fullscreen-image-container">
              <img
                src={fullScreenImageSrc}
                alt={fullScreenImageTitle}
                className="fullscreen-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="placeholder-content" style={{ display: 'none' }}>
                📷<br />
                {fullScreenImageTitle}<br />
                <small>Image not found</small>
              </div>
            </div>

            {/* Master/Deity Information Box */}
            {showDeityInfo && currentDeityInfo && (
              <div className="deity-info-box">
                <div className="deity-info-header">
                  <h3>{currentDeityInfo.title}</h3>
                  <button
                    className="info-close-button"
                    onClick={toggleDeityInfo}
                    title="Close information"
                  >
                    ×
                  </button>
                </div>
                <div className="deity-info-content">
                  <p>{currentDeityInfo.description || currentDeityInfo.info}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
