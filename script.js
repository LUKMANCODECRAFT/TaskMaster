/**
 * TaskMaster Pro - Crimson & Obsidian (Red & Black Edition)
 * High-Performance Modular Task Management Application
 */

// --- Configuration & Constants ---
const CONFIG = {
  STORAGE_KEY: 'taskmaster_data_v2',
  THEME_KEY: 'taskmaster_theme',
  SOUND_KEY: 'taskmaster_sound_muted',
  STREAK_KEY: 'taskmaster_streak_data',
  VERSION: '2.1.0'
};

const PRIORITIES = {
  high: { value: 'high', label: 'High', color: '#ff334b', icon: '🔴' },
  medium: { value: 'medium', label: 'Medium', color: '#f59e0b', icon: '🟡' },
  low: { value: 'low', label: 'Low', color: '#10b981', icon: '🟢' }
};

const CATEGORIES = {
  work: { value: 'work', label: 'Work', icon: '💼', color: '#ef4444' },
  personal: { value: 'personal', label: 'Personal', icon: '👤', color: '#f43f5e' },
  urgent: { value: 'urgent', label: 'Urgent', icon: '⚡', color: '#dc2626' },
  health: { value: 'health', label: 'Health', icon: '❤️', color: '#fb7185' },
  learning: { value: 'learning', label: 'Learning', icon: '🧠', color: '#fda4af' }
};

// --- Utility Functions ---
const utils = {
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
  
  formatDate: (dateString) => {
    if (!dateString) return { text: '', urgent: false, soon: false };
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return { 
        text: `⚠️ Overdue (${daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`})`, 
        urgent: true, 
        soon: false 
      };
    }
    if (diffDays === 0) return { text: '🎯 Due Today', urgent: false, soon: true };
    if (diffDays === 1) return { text: '⏳ Due Tomorrow', urgent: false, soon: true };
    return { 
      text: `📅 ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, 
      urgent: false, 
      soon: false 
    };
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  escapeHtml: (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// --- Web Audio Procedural Sound Synthesizer ---
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem(CONFIG.SOUND_KEY) === 'true';
    this.updateBodyClass();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.isMuted = !this.isMuted;
    localStorage.setItem(CONFIG.SOUND_KEY, this.isMuted);
    this.updateBodyClass();
    if (!this.isMuted) {
      this.initContext();
      this.playTone(587.33, 0.08, 'sine'); // D5 chime
    }
    return !this.isMuted;
  }

  updateBodyClass() {
    if (this.isMuted) {
      document.body.classList.add('sound-muted');
    } else {
      document.body.classList.remove('sound-muted');
    }
  }

  playTone(freq, duration = 0.1, type = 'sine', gainVal = 0.15) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playAdd() {
    if (this.isMuted) return;
    this.playTone(440, 0.08, 'triangle', 0.1); // A4
    setTimeout(() => this.playTone(659.25, 0.12, 'sine', 0.15), 60); // E5
  }

  playComplete() {
    if (this.isMuted) return;
    this.playTone(523.25, 0.08, 'sine', 0.12); // C5
    setTimeout(() => this.playTone(659.25, 0.08, 'sine', 0.12), 80); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.18), 160); // G5
    setTimeout(() => this.playTone(1046.50, 0.25, 'sine', 0.2), 240); // C6
  }

  playDelete() {
    if (this.isMuted) return;
    this.playTone(330, 0.08, 'sawtooth', 0.08);
    setTimeout(() => this.playTone(220, 0.12, 'triangle', 0.1), 60);
  }

  playTheme() {
    if (this.isMuted) return;
    this.playTone(700, 0.05, 'sine', 0.08);
  }
}

// --- Crimson & Ruby Particle Confetti System ---
class ConfettiSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.isActive = false;
  }
  
  init() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'confetti-canvas';
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  explode(x, y) {
    this.init();
    // Crimson, Scarlet, Ruby, Flame Gold, Coral, White Spark colors
    const colors = ['#ff334b', '#e11d48', '#ff4d6d', '#ff1e42', '#f59e0b', '#ffffff', '#fda4af', '#991b1b'];
    
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 12 + 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }
  
  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.life -= p.decay;
      p.rotation += p.rotationSpeed;
      
      if (p.life > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.life);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        this.ctx.restore();
        return true;
      }
      return false;
    });
    
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.isActive = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// --- Toast Notification System ---
class ToastSystem {
  constructor() {
    this.container = null;
    this.init();
  }
  
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }
  
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${utils.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;
    
    toast.querySelector('.toast-close').addEventListener('click', () => this.dismiss(toast));
    
    this.container.appendChild(toast);
    
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }
  
  dismiss(toast) {
    toast.style.animation = 'toastOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }
}

// --- Main Application Class ---
class TaskMasterApp {
  constructor() {
    this.tasks = [];
    this.filter = 'all';
    this.categoryFilter = 'all';
    this.sortBy = 'newest';
    this.searchQuery = '';
    this.confetti = new ConfettiSystem();
    this.sound = new SoundSystem();
    this.toast = new ToastSystem();
    
    this.cacheDOM();
    this.loadData();
    this.loadTheme();
    this.bindEvents();
    this.updateStreak();
    this.render();
  }
  
  cacheDOM() {
    this.dom = {
      taskForm: document.getElementById('task-form'),
      taskInput: document.getElementById('task-input'),
      taskPriority: document.getElementById('task-priority'),
      taskCategory: document.getElementById('task-category'),
      taskDue: document.getElementById('task-due'),
      taskList: document.getElementById('task-list'),
      emptyState: document.getElementById('empty-state'),
      emptyStateTitle: document.getElementById('empty-state-title'),
      emptyStateDesc: document.getElementById('empty-state-desc'),
      searchInput: document.getElementById('search-input'),
      searchClearBtn: document.getElementById('search-clear-btn'),
      sortSelect: document.getElementById('sort-select'),
      filterTabs: document.querySelectorAll('.filter-tab'),
      categoryChips: document.querySelectorAll('.category-chip'),
      visibleCount: document.getElementById('visible-count'),
      clearCompletedBtn: document.getElementById('clear-completed-btn'),
      progressCircle: document.getElementById('progress-circle'),
      progressPercent: document.getElementById('progress-percent'),
      totalTasks: document.getElementById('total-tasks'),
      activeTasks: document.getElementById('active-tasks'),
      completedTasks: document.getElementById('completed-tasks'),
      overdueTasks: document.getElementById('overdue-tasks'),
      streakText: document.getElementById('streak-text'),
      themeToggle: document.getElementById('theme-toggle'),
      soundToggle: document.getElementById('sound-toggle'),
      exportBtn: document.getElementById('export-btn'),
      importBtn: document.getElementById('import-btn'),
      importFileInput: document.getElementById('import-file-input'),
      editModal: document.getElementById('edit-modal'),
      editForm: document.getElementById('edit-form'),
      editId: document.getElementById('edit-id'),
      editText: document.getElementById('edit-text'),
      editPriority: document.getElementById('edit-priority'),
      editCategory: document.getElementById('edit-category'),
      editDue: document.getElementById('edit-due'),
      modalClose: document.querySelector('.modal-close'),
      modalOverlay: document.querySelector('.modal-overlay'),
      btnCancel: document.querySelector('.btn-cancel')
    };
  }
  
  loadData() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && Array.isArray(data.tasks)) {
          this.tasks = data.tasks;
        }
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
      this.tasks = [];
    }
  }
  
  saveData() {
    try {
      const data = { 
        version: CONFIG.VERSION, 
        updatedAt: new Date().toISOString(),
        tasks: this.tasks 
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save tasks:', e);
      this.toast.show('Error saving tasks to local storage', 'error');
    }
  }
  
  loadTheme() {
    const theme = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(CONFIG.THEME_KEY, next);
    this.sound.playTheme();
    this.toast.show(`Switched to ${next} theme`, 'info', 2000);
  }

  updateStreak() {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      let streakData = JSON.parse(localStorage.getItem(CONFIG.STREAK_KEY) || '{}');
      
      let count = streakData.streak || 0;
      const lastDate = streakData.lastDate;

      if (lastDate) {
        const last = new Date(lastDate);
        const today = new Date(todayStr);
        const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          count = 0; // Streak broken
        }
      }

      const completedToday = this.tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)).length;
      if (completedToday > 0 && lastDate !== todayStr) {
        count += 1;
        streakData = { streak: count, lastDate: todayStr };
        localStorage.setItem(CONFIG.STREAK_KEY, JSON.stringify(streakData));
      }

      this.dom.streakText.textContent = `${count} day streak`;
    } catch (e) {
      this.dom.streakText.textContent = '1 day streak';
    }
  }

  recordCompletionStreak() {
    const todayStr = new Date().toISOString().split('T')[0];
    let streakData = JSON.parse(localStorage.getItem(CONFIG.STREAK_KEY) || '{}');
    if (streakData.lastDate !== todayStr) {
      streakData.streak = (streakData.streak || 0) + 1;
      streakData.lastDate = todayStr;
      localStorage.setItem(CONFIG.STREAK_KEY, JSON.stringify(streakData));
      this.dom.streakText.textContent = `${streakData.streak} day streak`;
    }
  }
  
  bindEvents() {
    // Add task
    this.dom.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Keyboard shortcut to focus task input (Press '/')
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.dom.taskInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.dom.taskInput.focus();
      }
    });

    // Search with clear button
    this.dom.searchInput.addEventListener('input', utils.debounce(() => {
      this.searchQuery = this.dom.searchInput.value.trim().toLowerCase();
      this.dom.searchClearBtn.hidden = !this.searchQuery;
      this.render();
    }, 200));

    this.dom.searchClearBtn.addEventListener('click', () => {
      this.dom.searchInput.value = '';
      this.searchQuery = '';
      this.dom.searchClearBtn.hidden = true;
      this.dom.searchInput.focus();
      this.render();
    });
    
    // Sort
    this.dom.sortSelect.addEventListener('change', () => {
      this.sortBy = this.dom.sortSelect.value;
      this.render();
    });
    
    // Status Filter Tabs
    this.dom.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.dom.filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.filter = tab.dataset.filter;
        this.render();
      });
    });

    // Category Filter Chips
    this.dom.categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.dom.categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.categoryFilter = chip.dataset.category;
        this.render();
      });
    });

    // Clear Completed Tasks
    this.dom.clearCompletedBtn.addEventListener('click', () => {
      this.clearCompleted();
    });
    
    // Header Actions: Theme & Sound Toggles
    this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.dom.soundToggle.addEventListener('click', () => {
      const isUnmuted = this.sound.toggle();
      this.toast.show(isUnmuted ? 'Sound enabled 🔔' : 'Sound muted 🔇', 'info', 1800);
    });

    // Backup Export
    this.dom.exportBtn.addEventListener('click', () => this.exportBackup());

    // Backup Import
    this.dom.importBtn.addEventListener('click', () => this.dom.importFileInput.click());
    this.dom.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
    
    // Task List Actions (Event Delegation)
    this.dom.taskList.addEventListener('click', (e) => {
      const item = e.target.closest('.task-item');
      if (!item) return;
      const id = item.dataset.id;
      
      if (e.target.classList.contains('task-checkbox')) {
        this.toggleComplete(id, e.target.checked);
      } else if (e.target.closest('.btn-edit')) {
        this.openEditModal(id);
      } else if (e.target.closest('.btn-delete')) {
        this.deleteTask(id, item);
      }
    });
    
    // Edit Modal Form
    this.dom.editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEdit();
    });
    
    this.dom.modalClose.addEventListener('click', () => this.closeEditModal());
    this.dom.modalOverlay.addEventListener('click', () => this.closeEditModal());
    this.dom.btnCancel.addEventListener('click', () => this.closeEditModal());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.dom.editModal.hidden) {
        this.closeEditModal();
      }
    });
  }
  
  addTask() {
    const text = this.dom.taskInput.value.trim();
    if (!text) return;
    
    const task = {
      id: utils.generateId(),
      text: text,
      completed: false,
      priority: this.dom.taskPriority.value,
      category: this.dom.taskCategory.value,
      dueDate: this.dom.taskDue.value || null,
      createdAt: Date.now(),
      completedAt: null
    };
    
    this.tasks.unshift(task);
    this.saveData();
    this.render();
    
    this.dom.taskInput.value = '';
    this.dom.taskPriority.value = 'medium';
    this.dom.taskCategory.value = 'personal';
    this.dom.taskDue.value = '';
    
    this.sound.playAdd();
    this.toast.show('Mission added successfully!', 'success');
  }
  
  toggleComplete(id, completed) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = completed;
    task.completedAt = completed ? new Date().toISOString() : null;
    this.saveData();
    this.render();
    
    if (completed) {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        this.confetti.explode(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      this.sound.playComplete();
      this.recordCompletionStreak();
      this.toast.show('Mission completed! Great execution! 🔥', 'success');
    }
  }
  
  deleteTask(id, element) {
    this.sound.playDelete();
    element.classList.add('removing');
    setTimeout(() => {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.saveData();
      this.render();
      this.toast.show('Task deleted', 'info');
    }, 320);
  }

  clearCompleted() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      this.toast.show('No completed tasks to clear', 'info');
      return;
    }

    if (confirm(`Are you sure you want to remove all ${completedCount} completed tasks?`)) {
      this.sound.playDelete();
      this.tasks = this.tasks.filter(t => !t.completed);
      this.saveData();
      this.render();
      this.toast.show(`Cleared ${completedCount} completed tasks`, 'success');
    }
  }

  exportBackup() {
    const data = {
      app: 'TaskMaster Pro',
      version: CONFIG.VERSION,
      exportedAt: new Date().toISOString(),
      tasks: this.tasks
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `taskmaster_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.toast.show('Backup exported successfully! 📦', 'success');
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && Array.isArray(parsed.tasks)) {
          // Merge imported tasks, avoiding duplicate IDs
          const existingIds = new Set(this.tasks.map(t => t.id));
          let addedCount = 0;

          parsed.tasks.forEach(task => {
            if (!task.id || existingIds.has(task.id)) {
              task.id = utils.generateId();
            }
            this.tasks.push(task);
            existingIds.add(task.id);
            addedCount++;
          });

          this.saveData();
          this.render();
          this.toast.show(`Imported ${addedCount} tasks successfully! 🎉`, 'success');
        } else {
          this.toast.show('Invalid backup file format.', 'error');
        }
      } catch (err) {
        this.toast.show('Error reading JSON backup file.', 'error');
      }
      this.dom.importFileInput.value = '';
    };
    reader.readAsText(file);
  }
  
  openEditModal(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    
    this.dom.editId.value = task.id;
    this.dom.editText.value = task.text;
    this.dom.editPriority.value = task.priority || 'medium';
    this.dom.editCategory.value = task.category || 'personal';
    this.dom.editDue.value = task.dueDate || '';
    
    this.dom.editModal.hidden = false;
    setTimeout(() => this.dom.editText.focus(), 100);
  }
  
  closeEditModal() {
    this.dom.editModal.hidden = true;
  }
  
  saveEdit() {
    const id = this.dom.editId.value;
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    
    task.text = this.dom.editText.value.trim();
    task.priority = this.dom.editPriority.value;
    task.category = this.dom.editCategory.value;
    task.dueDate = this.dom.editDue.value || null;
    
    this.saveData();
    this.render();
    this.closeEditModal();
    this.toast.show('Mission updated successfully!', 'success');
  }
  
  getFilteredTasks() {
    let result = [...this.tasks];
    
    // Status Filter (All, Active, Completed)
    if (this.filter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (this.filter === 'completed') {
      result = result.filter(t => t.completed);
    }

    // Category Filter
    if (this.categoryFilter !== 'all') {
      result = result.filter(t => t.category === this.categoryFilter);
    }
    
    // Search Query
    if (this.searchQuery) {
      result = result.filter(t => 
        t.text.toLowerCase().includes(this.searchQuery) ||
        (t.category && t.category.toLowerCase().includes(this.searchQuery)) ||
        (t.priority && t.priority.toLowerCase().includes(this.searchQuery))
      );
    }
    
    // Sort Order
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'oldest': return a.createdAt - b.createdAt;
        case 'priority': {
          const pMap = { high: 3, medium: 2, low: 1 };
          return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
        }
        case 'due-date': {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        default: return (b.createdAt || 0) - (a.createdAt || 0); // newest
      }
    });
    
    return result;
  }
  
  getOverdueCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const due = new Date(t.dueDate + 'T00:00:00');
      return due < today;
    }).length;
  }
  
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = this.getOverdueCount();
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    this.dom.totalTasks.textContent = total;
    this.dom.activeTasks.textContent = active;
    this.dom.completedTasks.textContent = completed;
    this.dom.overdueTasks.textContent = overdue;
    this.dom.progressPercent.textContent = percent + '%';
    
    // Update SVG Progress Ring
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (percent / 100) * circumference;
    this.dom.progressCircle.style.strokeDashoffset = offset;
  }
  
  render() {
    const filtered = this.getFilteredTasks();
    const totalCount = this.tasks.length;
    
    // Update visible counter
    this.dom.visibleCount.textContent = `Showing ${filtered.length} of ${totalCount} missions`;

    // Render list or empty state
    if (filtered.length === 0) {
      this.dom.taskList.innerHTML = '';
      this.dom.emptyState.style.display = 'block';
      
      if (this.searchQuery) {
        this.dom.emptyStateTitle.textContent = 'No matching missions';
        this.dom.emptyStateDesc.textContent = `No tasks found matching "${this.searchQuery}". Try a different keyword.`;
      } else if (this.categoryFilter !== 'all') {
        this.dom.emptyStateTitle.textContent = `No ${this.categoryFilter} tasks`;
        this.dom.emptyStateDesc.textContent = 'No tasks in this category. Switch tag filter or add a task above.';
      } else if (this.filter === 'completed') {
        this.dom.emptyStateTitle.textContent = 'No completed tasks yet';
        this.dom.emptyStateDesc.textContent = 'Complete your pending missions to see them archived here.';
      } else {
        this.dom.emptyStateTitle.textContent = 'All missions complete!';
        this.dom.emptyStateDesc.textContent = 'Add a new mission above to keep pushing forward.';
      }
    } else {
      this.dom.emptyState.style.display = 'none';
      this.dom.taskList.innerHTML = filtered.map(task => this.renderTask(task)).join('');
    }
    
    this.updateStats();
  }
  
  renderTask(task) {
    const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
    const category = CATEGORIES[task.category] || CATEGORIES.personal;
    const dueInfo = utils.formatDate(task.dueDate);
    
    let dueBadge = '';
    if (dueInfo.text) {
      const dueClass = dueInfo.urgent ? 'badge-due-urgent' : (dueInfo.soon ? 'badge-due-soon' : 'badge-due');
      dueBadge = `<span class="task-badge ${dueClass}">${dueInfo.text}</span>`;
    }
    
    return `
      <li class="task-item priority-${task.priority || 'medium'} ${task.completed ? 'completed' : ''}" data-id="${task.id}" role="listitem">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}" />
        <div class="task-content">
          <div class="task-text">${utils.escapeHtml(task.text)}</div>
          <div class="task-meta">
            <span class="task-badge badge-priority-${task.priority || 'medium'}">${priority.icon} ${priority.label}</span>
            <span class="task-badge badge-category badge-category-${task.category || 'personal'}">${category.icon} ${category.label}</span>
            ${dueBadge}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-btn btn-edit" aria-label="Edit task" title="Edit Task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="task-btn btn-delete" aria-label="Delete task" title="Delete Task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </li>
    `;
  }
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  window.taskMasterApp = new TaskMasterApp();
});
