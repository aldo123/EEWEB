import { useEffect, useState }
  from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPinned,
  X,
  Save,
} from "lucide-react";

import { supabase }
  from "../../supabase/supabase";

export default function SiteManagement() {

  const [sites, setSites] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [openModal, setOpenModal] =
    useState(false);

  const [editingSite, setEditingSite] =
    useState(null);

  const [form, setForm] =
    useState({

      site: "",
      description: "",

    });

  // =====================================
  // LOAD
  // =====================================
  const loadSites = async () => {

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("sites")
          .select("*")
          .order("site", {
            ascending: true,
          });

      if (error) {

        console.log(error);

        return;

      }

      setSites(data || []);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadSites();

  }, []);

  // =====================================
  // FILTER
  // =====================================
  const filteredSites =
    sites.filter((item) =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // =====================================
  // ADD
  // =====================================
  const handleAddSite = () => {

    setEditingSite(null);

    setForm({

      site: "",
      description: "",

    });

    setOpenModal(true);

  };

  // =====================================
  // EDIT
  // =====================================
  const handleEditSite =
    (site) => {

      setEditingSite(site);

      setForm({

        site: site.site || "",
        description:
          site.description || "",

      });

      setOpenModal(true);

    };

  // =====================================
  // SAVE
  // =====================================
  const handleSaveSite =
    async () => {

      if (
        !form.site ||
        !form.description
      ) {

        alert(
          "Please complete all fields"
        );

        return;

      }

      try {

        // UPDATE
        if (editingSite) {

          const { error } =
            await supabase
              .from("sites")
              .update({

                site: form.site,
                description:
                  form.description,

              })
              .eq(
                "id",
                editingSite.id
              );

          if (error) {

            console.log(error);

            alert(
              "Update failed"
            );

            return;

          }

          alert(
            "Site updated"
          );

        }

        // ADD
        else {

          const { error } =
            await supabase
              .from("sites")
              .insert([{

                site: form.site,
                description:
                  form.description,

              }]);

          if (error) {

            console.log(error);

            alert(
              "Add site failed"
            );

            return;

          }

          alert(
            "Site added"
          );

        }

        setOpenModal(false);

        loadSites();

      } catch (error) {

        console.log(error);

      }

    };

  // =====================================
  // DELETE
  // =====================================
  const handleDeleteSite =
    async (site) => {

      const confirmDelete =
        window.confirm(
          `Delete ${site.site}?`
        );

      if (!confirmDelete)
        return;

      try {

        const { error } =
          await supabase
            .from("sites")
            .delete()
            .eq("id", site.id);

        if (error) {

          console.log(error);

          alert(
            "Delete failed"
          );

          return;

        }

        alert(
          "Site deleted"
        );

        loadSites();

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <div className="w-full">

      {/* HERO HEADER */}
      <div className="
      relative
      overflow-hidden

      rounded-[40px]

      border border-cyan-500/10

      bg-gradient-to-br
      from-[#071428]
      via-[#08192f]
      to-[#05101f]

      shadow-[0_0_80px_rgba(0,255,255,0.05)]

      px-10
      py-8
      mb-8

      flex
      items-start
      justify-between
      gap-6
      ">

        {/* GLOW */}
        <div className="
          absolute
          top-[-100px]
          right-[-100px]

          w-[300px]
          h-[300px]

          rounded-full

          bg-cyan-500/10

          blur-[120px]
          "></div>

        {/* LEFT */}
        <div className="relative z-10">

          <div className="
              inline-flex
              items-center
              gap-2

              px-4
              py-2

              rounded-2xl

              bg-cyan-500/10
              border border-cyan-500/20

              mb-5
              ">

            <div className="
                  w-2 h-2
                  rounded-full
                  bg-cyan-400
                  animate-pulse
                  "></div>

            <span className="
                  text-[11px]
                  font-black
                  tracking-[2px]
                  text-cyan-300
                  ">
              FACTORY CONFIGURATION
            </span>

          </div>

          <h1 className="
              text-6xl
              font-black
              leading-tight

              bg-gradient-to-r
              from-white
              via-cyan-200
              to-cyan-500

              bg-clip-text
              text-transparent
              ">

            Site Management

          </h1>

          <p className="
              mt-2
              text-slate-400
              text-sm
              font-medium
              ">

            Factory site configuration management

          </p>

        </div>

      </div>

      {/* SEARCH */}
      <div className="
      rounded-[32px]
      border border-white/5
      bg-white/[0.03]
      backdrop-blur-2xl
      p-4
      mb-8
      ">

          <div className="
          flex
          items-center
          gap-4
          ">

              {/* SEARCH */}
              <div className="relative flex-1">

                  <Search
                      size={18}
                      className="
                      absolute
                      left-5
                      top-1/2
                      -translate-y-1/2
                      text-slate-500
                      "
                  />

                  <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                          setSearch(
                              e.target.value
                          )
                      }
                      placeholder="Search site..."
                      className="
                      w-full
                      h-14
                      rounded-2xl

                      bg-black/20

                      border
                      border-white/5

                      pl-14
                      pr-5

                      text-white

                      placeholder:text-slate-500

                      outline-none

                      focus:border-green-500/20
                      "
                  />

              </div>

              {/* BUTTON */}
              <button
                  onClick={handleAddSite}
                  className="
                  h-14
                  px-7

                  rounded-2xl

                  bg-gradient-to-r
                  from-green-500
                  to-emerald-600

                  shadow-[0_0_40px_rgba(34,197,94,.25)]

                  hover:scale-[1.02]

                  transition-all

                  flex
                  items-center
                  gap-3

                  text-sm
                  font-bold
                  text-white

                  shrink-0
                  "
              >

                  <Plus size={18} />

                  Add Site

              </button>

          </div>

      </div>

      {/* GRID */}
      <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-3
      2xl:grid-cols-4
      gap-6">

        {filteredSites.map((item) => (

          <div
            key={item.id}
            className="relative
            rounded-[36px]
            border border-white/5
            bg-gradient-to-br
            from-[#07111f]
            via-[#081a2e]
            to-[#05101b]
            backdrop-blur-2xl
            overflow-hidden
            hover:border-green-500/20
            hover:shadow-[0_0_50px_rgba(0,255,200,0.08)]
            hover:-translate-y-1
            transition-all duration-300"
          >

            {/* GLOW */}
            <div className="absolute top-[-60px] right-[-60px]
            w-[180px] h-[180px]
            bg-green-500/10
            blur-[80px]
            rounded-full"></div>

            {/* CONTENT */}
            <div className="relative z-10 p-7">

              {/* ICON */}
              <div className="w-20 h-20 rounded-[28px]
              bg-gradient-to-br
              from-green-400
              to-emerald-600
              flex items-center justify-center
              shadow-[0_0_40px_rgba(34,197,94,.35)]">

                <MapPinned
                  size={34}
                  className="text-white"
                />

              </div>

              {/* SITE */}
              <h1 className="mt-7 text-4xl font-black text-white">

                {item.site}

              </h1>

              {/* DESC */}
              <p className="mt-3 text-slate-400 leading-7 min-h-[60px]">

                {item.description}

              </p>

              {/* ACTION */}
              <div className="mt-8 flex items-center gap-3">

                {/* EDIT */}
                <button
                  onClick={() =>
                    handleEditSite(
                      item
                    )
                  }
                  className="flex-1 h-12 rounded-2xl
                  bg-yellow-500/10
                  border border-yellow-500/20
                  flex items-center justify-center gap-2
                  hover:bg-yellow-500/20
                  transition-all"
                >

                  <Pencil
                    size={16}
                    className="text-yellow-400"
                  />

                  <span className="text-yellow-400 text-sm font-medium">

                    Edit

                  </span>

                </button>

                {/* DELETE */}
                <button
                  onClick={() =>
                    handleDeleteSite(
                      item
                    )
                  }
                  className="w-12 h-12 rounded-2xl
                  bg-red-500/10
                  border border-red-500/20
                  flex items-center justify-center
                  hover:bg-red-500/20
                  transition-all"
                >

                  <Trash2
                    size={16}
                    className="text-red-400"
                  />

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* MODAL */}
      {openModal && (

        <div className="fixed inset-0 z-50
        bg-black/70
        backdrop-blur-md
        flex items-center justify-center p-6">

          <div className="w-full max-w-[520px]
          rounded-[36px]
          border border-white/10
          bg-[#07111f]
          overflow-hidden">

            {/* HEADER */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">

              <div>

                <h1 className="text-3xl font-black text-white">

                  {editingSite
                    ? "Edit Site"
                    : "Add Site"}

                </h1>

                <p className="text-slate-500 mt-2">

                  Factory site configuration

                </p>

              </div>

              <button
                onClick={() =>
                  setOpenModal(
                    false
                  )
                }
                className="w-12 h-12 rounded-2xl
                bg-white/[0.04]
                border border-white/5
                flex items-center justify-center"
              >

                <X size={18} />

              </button>

            </div>

            {/* BODY */}
            <div className="p-8 space-y-5">

              {/* SITE */}
              <div>

                <label className="block text-sm text-slate-400 mb-2">

                  Site

                </label>

                <input
                  type="text"
                  value={form.site}
                  onChange={(e) =>
                    setForm({

                      ...form,
                      site:
                        e.target.value,

                    })
                  }
                  className="w-full h-14 rounded-2xl
                  bg-black/20
                  border border-white/5
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500/20"
                />

              </div>

              {/* DESCRIPTION */}
              <div>

                <label className="block text-sm text-slate-400 mb-2">

                  Description

                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({

                      ...form,
                      description:
                        e.target.value,

                    })
                  }
                  className="w-full rounded-2xl
                  bg-black/20
                  border border-white/5
                  p-5
                  text-white
                  outline-none
                  resize-none
                  focus:border-green-500/20"
                ></textarea>

              </div>

            </div>

            {/* FOOTER */}
            <div className="px-8 py-6 border-t border-white/5 flex items-center justify-end gap-4">

              <button
                onClick={() =>
                  setOpenModal(
                    false
                  )
                }
                className="h-12 px-5 rounded-2xl
                bg-white/[0.04]
                border border-white/5
                text-slate-300"
              >

                Cancel

              </button>

              <button
                onClick={
                  handleSaveSite
                }
                className="h-12 px-6 rounded-2xl
                bg-gradient-to-r from-green-500 to-emerald-600
                flex items-center gap-3
                font-bold shadow-[0_0_30px_rgba(34,197,94,.3)]"
              >

                <Save size={18} />

                Save Site

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}