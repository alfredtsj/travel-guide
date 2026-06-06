// localStorage 草稿管理
export function useStorage() {
  function save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch {
      return false
    }
  }

  function load(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function remove(key) {
    localStorage.removeItem(key)
  }

  return { save, load, remove }
}
