import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import DzogchenTermsMainContent from './components/DzogchenTermsMainContent';

type Message = {
  sender: 'user' | 'assistant';
  content: string;
};

const App = () => {
  console.log("API Key:", process.env.REACT_APP_OPENAI_API_KEY);
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
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Fix editor direction on content change
  useEffect(() => {
    if (activeMenu === 'help' && editorRef.current) {
      const editor = editorRef.current;
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'left';
      
      // Initialize content directly in DOM without triggering re-render
      if (!editor.innerHTML || editor.innerHTML.trim() === '') {
        editor.innerHTML = '<p><br></p>';
      } else if (editorContent && editor.innerHTML !== editorContent) {
        // Only update if content is different and we're not actively typing
        const selection = window.getSelection();
        const isTyping = selection && selection.rangeCount > 0 && selection.focusNode === editor;
        if (!isTyping) {
          editor.innerHTML = editorContent;
        }
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

  const handleRigpaAIClick = () => {
    setActiveMenu('chat'); // Show chat in main content instead of modal
  };

  const handleMenuClick = (menuId: string) => {
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
    if (parentLabel === 'Gallery' && subItem === 'Deity Collection') {
      setShowGalleryModal(true);
    } else if (parentLabel === 'Gallery' && subItem === 'Lineage Masters') {
      setShowLineageMastersModal(true);
    } else if (parentLabel === 'Dictionary' && subItem === 'Tibetan Alphabet') {
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
      setEditorContent(content);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

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
          model: 'gpt-3.5-turbo',
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

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const menuItems = [
    { id: 'chat', label: 'RigpaAI', subItems: [] },
    {
      id: 'gallery',
      label: 'Gallery',
      subItems: ['Deity Collection', 'Lineage Masters']
    },
    {
      id: 'dictionary',
      label: 'Dictionary',
      subItems: ['Tibetan Alphabet']
    },
    { id: 'dzogchen-terms', label: 'Master Dzogchen Terms', subItems: [] },
    { id: 'help', label: 'Editor', subItems: [] },
  ];

  // Deity images data
  const deityImages = [
    { 
      id: 1, 
      src: '/DorjeDrolo.jpg', 
      alt: 'Deity 1', 
      title: 'Dorje Drolo',
      description: 'Dorje Drolo is a wrathful manifestation of Guru Rinpoche (Padmasambhava). This fierce form represents the power to overcome obstacles and negative forces on the spiritual path. Often depicted riding a pregnant tigress, Dorje Drolo embodies the transformative energy needed to cut through illusion and establish the dharma in difficult circumstances.'
    },
    { 
      id: 2, 
      src: '/Manjushri.jpg', 
      alt: 'Deity 2', 
      title: 'Manjushri',
      description: 'Manjushri is the Bodhisattva of Wisdom and represents the perfection of transcendent knowledge. Often depicted holding a flaming sword that cuts through ignorance and a lotus bearing the Perfection of Wisdom sutra, Manjushri embodies the sharp clarity of awakened mind that sees through all conceptual limitations to ultimate truth.'
    },
    { 
      id: 3, 
      src: '/Padmasambava.jpg', 
      alt: 'Deity 3', 
      title: 'Padmasambhava',
      description: 'Padmasambhava, also known as Guru Rinpoche, is the "Lotus-Born" master who brought Buddhism to Tibet in the 8th century. Revered as the Second Buddha, he established the Dharma in Tibet and hid countless treasure teachings (terma) to be discovered in future times. He represents the perfect union of wisdom and compassion.'
    },
    { 
      id: 4, 
      src: '/Troma.jpg', 
      alt: 'Deity 4', 
      title: 'Troma Nagmo',
      description: 'Troma Nagmo is a wrathful dakini and protector deity in the Dzogchen tradition. Known as the "Black Wrathful Mother," she represents the fierce compassion that destroys ego-grasping and obstacles to enlightenment. Her practice is considered especially powerful for cutting through the subtlest mental obscurations and revealing the nature of mind.'
    },
    { 
      id: 5, 
      src: '/Vajrakilaya.jpg', 
      alt: 'Deity 5', 
      title: 'Vajrakilaya',
      description: 'Vajrakilaya (Dorje Phurba) is a wrathful deity representing the enlightened activity of all Buddhas. Depicted with three faces and six arms holding ritual daggers (phurbas), Vajrakilaya embodies the power to eliminate obstacles, both outer and inner, that prevent spiritual realization. This practice is central to removing impediments on the path to enlightenment.'
    },
    { 
      id: 6, 
      src: '/Vajrayogini.jpg', 
      alt: 'Deity 6', 
      title: 'Vajrayogini',
      description: 'Vajrayogini is a female Buddha representing the union of wisdom and bliss. Often depicted as a dancing red figure holding a curved knife and skull cup, she embodies the transformative power of tantric practice. Vajrayogini represents the wisdom that directly perceives emptiness and the blissful energy that arises from this realization.'
    },
    { 
      id: 7, 
      src: '/VajrasattvaYabYum.jpg', 
      alt: 'Deity 7', 
      title: 'Vajrasattva Yab-Yum',
      description: 'Vajrasattva in union (Yab-Yum) represents the perfect integration of wisdom and compassion, method and wisdom. Vajrasattva is the deity of purification, whose practice cleanses negative karma and obscurations. In union form, this represents the inseparable nature of clarity and emptiness, the fundamental ground of being in Dzogchen.'
    },
    { 
      id: 8, 
      src: '/PadmasambavaYabYum.jpg', 
      alt: 'Deity 8', 
      title: 'Padmasambhava Yab-Yum',
      description: 'Padmasambhava in union with his consort represents the perfect balance of masculine and feminine principles, skillful means and wisdom. This form symbolizes the complete realization where all dualities are transcended and the practitioner embodies the perfect unity of awareness and emptiness that characterizes the Dzogchen view.'
    },
    { 
      id: 9, 
      src: '/KuntunzangpoYabYum.jpg', 
      alt: 'Deity 9', 
      title: 'Samantabhadra Yab-Yum',
      description: 'Samantabhadra (Kuntuzangpo) in union represents the primordial Buddha, the dharmakaya aspect of enlightenment. In Dzogchen, this figure symbolizes the original purity and spontaneous presence of the nature of mind. The union aspect represents the inseparable unity of awareness and emptiness, the fundamental ground from which all phenomena arise and dissolve.'
    },
    { 
      id: 10, 
      src: '/PadmasambavaRainbowBody.jpg', 
      alt: 'Deity 10', 
      title: 'Padmasambhava Rainbow Body',
      description: 'Padmasambhava manifesting the rainbow body represents the ultimate achievement in Dzogchen practice - the dissolution of the physical body into pure light at the time of death. This rainbow light body symbolizes the complete realization of the nature of mind and the perfect integration of wisdom and compassion beyond all conceptual limitations.'
    }
  ];

  // Lineage masters data
  const lineageMasters = [
    { 
      id: 1, 
      src: '/Longchenpa.jpeg', 
      alt: 'Master 1', 
      title: 'Longchenpa',
      description: 'Longchen Rabjam (1308-1364) was one of the greatest scholars and realized masters of the Nyingma tradition. Known as "The Great Vast Expanse," he systematized and clarified the Dzogchen teachings in his profound works including the Seven Treasuries. His writings present the most complete and accessible exposition of the Great Perfection, emphasizing the natural state of primordial awareness.'
    },
    { 
      id: 2, 
      src: '/DudjomLingpa.jpg', 
      alt: 'Master 2', 
      title: 'Dudjom Lingpa',
      description: 'Dudjom Lingpa (1835-1904) was a great tertön (treasure revealer) and master of the Nyingma tradition. He revealed numerous important terma teachings and established retreat centers where practitioners could engage in intensive Dzogchen practice. His lineage continues today through various emanations and heart disciples who maintain his pure transmission of the Great Perfection.'
    },
    { 
      id: 3, 
      src: '/TertonMigyorDorje.jpg', 
      alt: 'Master 3', 
      title: 'Tertön Migyur Dorje',
      description: 'Chokgyur Dechen Lingpa, also known as Tertön Migyur Dorje (1829-1870), was one of the greatest treasure revealers of the 19th century. He discovered numerous important terma cycles including profound Dzogchen teachings. His revelations bridge the ancient wisdom of Padmasambhava with the needs of modern practitioners, providing clear instructions for realization.'
    },
    { 
      id: 4, 
      src: '/RigdzinKunzangSherab.jpg', 
      alt: 'Master 4', 
      title: 'Rigdzin Kunzang Sherab',
      description: 'Rigdzin Kunzang Sherab was a realized master in the tradition of the Great Perfection, known for his profound realization and clear exposition of Dzogchen teachings. Masters like him represent the unbroken lineage of wisdom transmission that maintains the purity and power of these ancient instructions for awakening to our true nature.'
    },
    { 
      id: 5, 
      src: '/YesheSogyal.jpg', 
      alt: 'Master 5', 
      title: 'Yeshe Tsogyal',
      description: 'Yeshe Tsogyal (also known as Khandro Yeshe Tsogyal) was the principal consort and spiritual partner of Guru Rinpoche. She was instrumental in receiving, preserving, and hiding many of the treasure teachings. As a fully realized dakini, she represents the wisdom aspect of enlightenment and is revered as the "Mother of all Buddhas" in the Nyingma tradition.'
    }
  ];

  return (
    <div className="App">
      <div className="menu-panel">
        <div className="picture-box">
          <img 
            src="/Hung.png" 
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
            </div>
            <div
              ref={editorRef}
              key="rich-text-editor"
              className="rich-text-editor"
              contentEditable={true}
              onInput={handleEditorInput}
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
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'Arial, sans-serif'
              }}
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
              <h2>RigpaAI Chat</h2>
              <button className="close-button" onClick={() => setActiveMenu(null)}>
                ← Back to Home
              </button>
            </div>
            <div className="chat-main-container">
              <div className="chat-window" ref={chatWindowRef}>
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    <strong>{message.sender === 'user' ? 'You' : 'RigpaAI'}:</strong>
                    <span>{message.content}</span>
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
          <div className="logo-container">
            <div className="logo-circle">
              <img 
                src="/Hung.png" 
                alt="Logo" 
                className="logo-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="logo-placeholder" style={{ display: 'none' }}>
                📷<br />
                Logo not found<br />
                <small>Place Hung.png in /public folder</small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="gallery-modal-overlay" onClick={closeAllModals}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-header">
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
            <div className="gallery-header">
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
                  <p>{currentDeityInfo.description}</p>
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
