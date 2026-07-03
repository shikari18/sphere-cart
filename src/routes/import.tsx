import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search, Plus, Trash2, CheckCircle2, ShoppingBag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PhoneShell } from "@/components/PhoneShell";
import { fetchCjProducts, fetchImportedProducts, importCjProduct, removeImportedProduct } from "@/lib/cj-api";
import { toast } from "sonner";

export const Route = createFileRoute("/import")({
  component: ImportPage,
});

function ImportPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();

  // Debounce search input
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  });

  // Query imported products from local JSON database
  const { data: importedProducts = [] } = useQuery({
    queryKey: ["imported-products"],
    queryFn: () => fetchImportedProducts(),
  });

  // Query global CJ catalog (with bypassLocal: true)
  const { data: cjProducts = [], isLoading: isLoadingCatalog } = useQuery({
    queryKey: ["cj-global-catalog", debouncedSearch],
    queryFn: () => fetchCjProducts({ search: debouncedSearch || "dress", size: 20, bypassLocal: true }),
  });

  // Import Mutation
  const importMutation = useMutation({
    mutationFn: (product: any) => importCjProduct({ product }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imported-products"] });
      queryClient.invalidateQueries({ queryKey: ["cj-products"] }); // Refresh storefront products
      toast.success("Product imported to local database!");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to import product.");
    }
  });

  // Remove Mutation
  const removeMutation = useMutation({
    mutationFn: (pid: string) => removeImportedProduct({ pid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imported-products"] });
      queryClient.invalidateQueries({ queryKey: ["cj-products"] }); // Refresh storefront products
      toast.success("Product removed from local database.");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to remove product.");
    }
  });

  // Check if a product ID is already imported
  const isImported = (pid: string) => importedProducts.some((p: any) => p.id === pid);

  return (
    <PhoneShell>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3 px-4 pt-5 pb-3">
          <Link to="/me" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold flex items-center gap-1.5">
              Admin Import Panel
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium">Import products from CJ Dropshipping</p>
          </div>
        </div>
      </header>

      {/* Database Status Strip */}
      <div className="mx-4 mt-4 p-3 rounded-2xl bg-primary-soft/50 border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[11px] font-bold text-primary">LOCAL DATABASE STATUS</p>
            <p className="text-[10px] text-muted-foreground">{importedProducts.length} product(s) active on storefront</p>
          </div>
        </div>
        <span className="text-[10px] bg-primary/10 text-primary font-bold rounded-full px-2 py-0.5 border border-primary/20">
          JSON Live
        </span>
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground animate-pulse" />
          <input 
            placeholder="Search CJ catalog to import..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Simple inline debounce trigger
              const val = e.target.value;
              setTimeout(() => setDebouncedSearch(val), 500);
            }}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" 
          />
        </div>
      </div>

      {/* CJ catalog list */}
      <main className="p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CJ Dropshipping Catalog</h3>
          <span className="text-[10px] text-muted-foreground">Showing 20 items</span>
        </div>

        <div className="flex flex-col gap-3">
          {isLoadingCatalog ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-2xl bg-white border border-border/60 shadow-[var(--shadow-card)] animate-pulse">
                <div className="w-20 h-20 bg-secondary rounded-xl" />
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <div className="h-3.5 bg-secondary rounded w-5/6" />
                  <div className="h-3 bg-secondary rounded w-2/3" />
                  <div className="h-7 bg-secondary rounded w-24 mt-1" />
                </div>
              </div>
            ))
          ) : (
            cjProducts.map((p: any) => {
              const imported = isImported(p.id);
              return (
                <div key={p.id} className="flex gap-3 p-3 rounded-2xl bg-white border border-border/60 shadow-[var(--shadow-card)] hover:border-primary/20 transition duration-300">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary border border-border/40 shrink-0">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-xs font-bold truncate pr-1">{p.title}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">SKU: {p.sku}</p>
                      <p className="text-xs font-extrabold text-primary mt-1">₵{p.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      {imported ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Imported
                          </span>
                          <button 
                            onClick={() => removeMutation.mutate(p.id)}
                            className="p-1 rounded-full text-rose-500 hover:bg-rose-50 transition"
                            title="Remove from local database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => importMutation.mutate(p)}
                          className="bg-primary text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg shadow-primary-soft/40 hover:bg-primary-dark transition duration-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Import to Store
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!isLoadingCatalog && cjProducts.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-10">No products found in catalog.</p>
          )}
        </div>
      </main>
    </PhoneShell>
  );
}
