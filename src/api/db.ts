// Low-level Cloud Firestore helpers shared by every api/*.ts module.
// Each document is returned with its `id` merged in; callers map `id` onto the
// entity's own id field (shiftId, locationId, …).
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type WhereFilterOp,
} from 'firebase/firestore'
import { db } from '../firebase'

export type Raw = Record<string, unknown> & { id: string }
export type Filter = [field: string, op: WhereFilterOp, value: unknown]

export async function getAll(name: string): Promise<Raw[]> {
  const snap = await getDocs(collection(db, name))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getById(name: string, id: string): Promise<Raw | null> {
  const snap = await getDoc(doc(db, name, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function queryBy(
  name: string,
  filters: Filter[],
): Promise<Raw[]> {
  const q = query(
    collection(db, name),
    ...filters.map(([f, o, v]) => where(f, o, v)),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Create with an explicit id, or let Firestore generate one.
export async function create(
  name: string,
  data: Record<string, unknown>,
  id?: string,
): Promise<Raw> {
  const ref = id ? doc(db, name, id) : doc(collection(db, name))
  await setDoc(ref, data)
  return { id: ref.id, ...data }
}

export async function update(
  name: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<Raw | null> {
  await updateDoc(doc(db, name, id), patch)
  return getById(name, id)
}

export async function remove(name: string, id: string): Promise<void> {
  await deleteDoc(doc(db, name, id))
}

// Re-export for the atomic swap-approval batch write.
export { db, doc, writeBatch }
