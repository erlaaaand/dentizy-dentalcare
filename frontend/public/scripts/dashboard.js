// Dashboard utility functions and interactions

// State Management
const DashboardState = {
    sidebarMinimized: false,
    currentPage: 'dashboard',
    notifications: [],
    userInfo: {
        name: 'dr. Erland Agustian',
        role: 'Dokter',
        email: 'erland@dentizy.com'
    }
}

// Utility Functions
const Utils = {
    formatTime: (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    },

    formatDate: (date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount)
    },

    showToast: (message, type = 'info') => {
        // Create toast element
        const toast = document.createElement('div')
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' :
                    type === 'warning' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
            }`
        toast.textContent = message

        // Add to DOM
        document.body.appendChild(toast)

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)'
            toast.style.opacity = '1'
        }, 100)

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)'
            toast.style.opacity = '0'
            setTimeout(() => {
                document.body.removeChild(toast)
            }, 300)
        }, 3000)
    },

    debounce: (func, wait) => {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }
}

// Loading Manager
const LoadingManager = {
    show: (element) => {
        if (element) {
            element.style.opacity = '0.5'
            element.style.pointerEvents = 'none'
        }
    },

    hide: (element) => {
        if (element) {
            element.style.opacity = '1'
            element.style.pointerEvents = 'auto'
        }
    },

    showOverlay: () => {
        const overlay = document.getElementById('loading-overlay')
        if (overlay) {
            overlay.classList.remove('hidden')
            overlay.classList.add('flex')
        }
    },

    hideOverlay: () => {
        const overlay = document.getElementById('loading-overlay')
        if (overlay) {
            overlay.classList.add('hidden')
            overlay.classList.remove('flex')
        }
    }
}

// Modal Manager
const ModalManager = {
    show: (title, content, options = {}) => {
        const modal = document.createElement('div')
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
        modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
        <header class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
        </header>
        <div class="p-6">
          ${content}
        </div>
        <footer class="p-6 border-t border-gray-200 flex justify-end space-x-2">
          ${options.cancelButton !== false ? '<button class="modal-cancel px-4 py-2 text-gray-600 hover:text-gray-800">Batal</button>' : ''}
          <button class="modal-confirm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">${options.confirmText || 'OK'}</button>
        </footer>
      </div>
    `

        document.body.appendChild(modal)

        // Event listeners
        const cancelBtn = modal.querySelector('.modal-cancel')
        const confirmBtn = modal.querySelector('.modal-confirm')

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.remove()
                if (options.onCancel) options.onCancel()
            })
        }

        confirmBtn.addEventListener('click', () => {
            modal.remove()
            if (options.onConfirm) options.onConfirm()
        })

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove()
                if (options.onCancel) options.onCancel()
            }
        })

        return modal
    }
}

// Animation Utilities
const AnimationUtils = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0'
        element.style.display = 'block'

        const fadeEffect = setInterval(() => {
            if (!element.style.opacity) {
                element.style.opacity = 0
            }
            if (element.style.opacity < 1) {
                element.style.opacity = parseFloat(element.style.opacity) + 0.1
            } else {
                clearInterval(fadeEffect)
            }
        }, duration / 10)
    },

    slideDown: (element, duration = 300) => {
        element.style.maxHeight = '0'
        element.style.overflow = 'hidden'
        element.style.transition = `max-height ${duration}ms ease-in-out`

        setTimeout(() => {
            element.style.maxHeight = element.scrollHeight + 'px'
        }, 10)
    },

    pulse: (element, times = 3) => {
        let count = 0
        const pulseInterval = setInterval(() => {
            element.style.transform = 'scale(1.05)'
            setTimeout(() => {
                element.style.transform = 'scale(1)'
            }, 150)

            count++
            if (count >= times) {
                clearInterval(pulseInterval)
            }
        }, 300)
    }
}

// Data Management
const DataManager = {
    // Simulate API calls
    fetchDashboardStats: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    patientsToday: 12,
                    confirmedAppointments: 8,
                    newPatients: 3,
                    totalPatients: 450
                })
            }, 500)
        })
    },

    fetchSchedule: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: '1',
                        time: '09:00',
                        patient: 'Sari Indah',
                        treatment: 'Pembersihan Karang Gigi',
                        status: 'completed'
                    },
                    {
                        id: '2',
                        time: '10:30',
                        patient: 'Budi Santoso',
                        treatment: 'Tambal Gigi',
                        status: 'waiting'
                    }
                ])
            }, 300)
        })
    },

    updatePatientStatus: async (patientId, status) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, patientId, status })
            }, 200)
        })
    }
}

// Real-time Updates
const RealTimeManager = {
    init: () => {
        // Update time every minute
        setInterval(() => {
            const now = new Date()
            const timeElements = document.querySelectorAll('.current-time')
            timeElements.forEach(el => {
                el.textContent = Utils.formatTime(now)
            })
        }, 60000)

        // Simulate real-time notifications
        setInterval(() => {
            if (Math.random() > 0.9) {
                RealTimeManager.addNotification({
                    title: 'Update Sistem',
                    message: 'Data telah diperbarui',
                    type: 'info'
                })
            }
        }, 30000)
    },

    addNotification: (notification) => {
        DashboardState.notifications.unshift({
            ...notification,
            id: Date.now().toString(),
            time: new Date().toLocaleString('id-ID')
        })

        // Update notification badge
        const badge = document.querySelector('.notification-badge')
        if (badge) {
            badge.textContent = DashboardState.notifications.length
        }

        // Show toast
        Utils.showToast(notification.message, notification.type)
    }
}

// Keyboard Shortcuts
const KeyboardManager = {
    init: () => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault()
                        window.location.href = '/dashboard'
                        break
                    case '2':
                        e.preventDefault()
                        window.location.href = '/dashboard/appointments'
                        break
                    case '3':
                        e.preventDefault()
                        window.location.href = '/dashboard/patients'
                        break
                    case 's':
                        e.preventDefault()
                        const searchInput = document.querySelector('input[placeholder*="Cari"]')
                        if (searchInput) searchInput.focus()
                        break
                }
            }

            // Escape key to close modals/dropdowns
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal, .dropdown-menu.show')
                modals.forEach(modal => {
                    modal.classList.add('hidden')
                    modal.classList.remove('show')
                })
            }
        })
    }
}

// Form Validation
const FormValidator = {
    validateRequired: (value) => {
        return value && value.trim().length > 0
    },

    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    },

    validatePhone: (phone) => {
        const re = /^(\+62|0)[0-9]{9,12}$/
        return re.test(phone.replace(/[-\s]/g, ''))
    },

    showError: (input, message) => {
        const errorElement = input.parentNode.querySelector('.error-message')
        if (errorElement) {
            errorElement.textContent = message
            errorElement.classList.remove('hidden')
        }
        input.classList.add('border-red-500')
    },

    clearError: (input) => {
        const errorElement = input.parentNode.querySelector('.error-message')
        if (errorElement) {
            errorElement.classList.add('hidden')
        }
        input.classList.remove('border-red-500')
    }
}

// Local Storage Manager
const StorageManager = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.warn('LocalStorage not available:', error)
        }
    },

    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue
        } catch (error) {
            console.warn('LocalStorage not available:', error)
            return defaultValue
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.warn('LocalStorage not available:', error)
        }
    }
}

// Export for use in React components
if (typeof window !== 'undefined') {
    window.DashboardUtils = {
        Utils,
        LoadingManager,
        ModalManager,
        AnimationUtils,
        DataManager,
        RealTimeManager,
        KeyboardManager,
        FormValidator,
        StorageManager
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦷 Dashboard utilities loaded')
    RealTimeManager.init()
    KeyboardManager.init()
})