export type Trader = { id: number; name: string; phone?: string; email?: string; opening_balance?: string; vehicles_count?: number };
export type Vehicle = { id: number; stock_no: string; vin: string; make: string; model: string; year?: number; color?: string; status: string; purchase_price: string; container_cost?: string; road_cost?: string; penalties?: string; total_cost: string; trader?: Trader };
export type Pagination<T> = { data: T[]; current_page: number; last_page: number; total: number; links: { url: string | null; label: string; active: boolean }[] };
