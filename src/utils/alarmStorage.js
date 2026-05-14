const DB_NAME   = 'mizan_alarm_db'
const STORE     = 'audio'
const KEY       = 'custom'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE)
    req.onsuccess  = e => resolve(e.target.result)
    req.onerror    = () => reject(req.error)
  })
}

export async function saveAlarmFile(arrayBuffer, fileName) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ buffer: arrayBuffer, name: fileName }, KEY)
    tx.oncomplete = resolve
    tx.onerror    = () => reject(tx.error)
  })
}

export async function loadAlarmFile() {
  try {
    const db = await openDb()
    return new Promise(resolve => {
      const tx  = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve(req.result || null)  // { buffer, name }
      req.onerror   = () => resolve(null)
    })
  } catch { return null }
}

export async function clearAlarmFile() {
  try {
    const db = await openDb()
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(KEY)
      tx.oncomplete = resolve
      tx.onerror    = resolve
    })
  } catch {}
}
