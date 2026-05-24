import React, {
    useEffect,
    useState
} from "react";

import { supabase }
    from "../../supabase/supabase";

import * as XLSX from "xlsx";

import {
    Upload,
    Search,
    Trash2,
    Pencil,
    Plus,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    XCircle
} from "lucide-react";

const excelDateToJSDate = (
    serial
) => {

    if (!serial)
        return "";

    // kalau sudah string date
    if (
        typeof serial === "string"
    ) {

        return serial;

    }

    // convert excel serial
    const utc_days =
        Math.floor(
            serial - 25569
        );

    const utc_value =
        utc_days * 86400;

    const date_info =
        new Date(
            utc_value * 1000
        );

    return date_info
        .toISOString()
        .split("T")[0];

};

const normalizeText = (
    value
) => {

    return String(value || "")
        .trim()
        .toLowerCase();

};

export default function RequestList() {

    const [requests, setRequests] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [summaryFilter, setSummaryFilter] =
        useState([
            "PSC",
            "ONGOING",
            "OVERDUE"
        ]);

    const handleSummaryFilter = (filter) => {

        setSummaryFilter((prev) => {

            // REMOVE FILTER
            if (prev.includes(filter)) {

                return prev.filter(
                    (x) => x !== filter
                );

            }

            // ADD FILTER
            return [
                ...prev,
                filter
            ];

        });

    };

    const [editingItem, setEditingItem] =
        useState(null);

    const [editForm, setEditForm] =
        useState({});

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [addForm, setAddForm] =
        useState({

            oa_pr: "",
            pr_no: "",
            po: "",
            io: "",
            cost_center: "",
            description: "",
            qty: "",
            oum: "",
            price: "",
            total_cost: "",
            vendor: "",
            additional_info: "",
            pic: "",
            original_due: "",
            revised_due: "",
            status: "Ongoing",
            psc: "NA"

        });

    // ========================================
    // LOAD DATA
    // ========================================

    useEffect(() => {

        loadRequests();

    }, []);

    const loadRequests =
        async () => {

            const {
                data,
                error
            } =
                await supabase
                    .from("request_list")
                    .select("*")
                    .order("id", {
                        ascending: false
                    });

            if (error) {

                console.log(error);
                return;

            }

            setRequests(data || []);

        };

    // ========================================
    // IMPORT EXCEL
    // ========================================

    const handleImportExcel =
        async (e) => {

            const file =
                e.target.files[0];

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload =
                async (evt) => {

                    try {

                        const data =
                            evt.target.result;

                        const workbook =
                            XLSX.read(data, {
                                type: "binary"
                            });

                        const sheetName =
                            workbook.SheetNames[0];

                        const sheet =
                            workbook.Sheets[sheetName];

                        const json =
                            XLSX.utils.sheet_to_json(
                                sheet
                            );

                        // ====================================
                        // DUPLICATE INFO
                        // ====================================

                        const duplicateList = [];

                        // ====================================
                        // FORMAT DATA
                        // ====================================

                        const formatted =
                            json
                                .map((item) => {

                                    return {

                                        oa_pr:
                                            item["OA-PR#"] || "",

                                        pr_no:
                                            item["PR.NO"] || "",

                                        po:
                                            item["PO"] || "",

                                        io:
                                            item["IO"] || "",

                                        cost_center:

                                            item["Cost center"] ||

                                            item["Cost Centre"] ||

                                            item["Cost centre"] ||

                                            item["Cost Center"] ||

                                            "",

                                        description:
                                            item["Description"] || "",

                                        qty:
                                            item["Qty"] || "",

                                        oum:
                                            item["OUM"] || "",

                                        price:
                                            item["Price"] || "",

                                        total_cost:
                                            item["Total Cost"] || "",

                                        vendor_code:
                                            item["Code Vendor"] || "",

                                        vendor:
                                            item["Vendor"] || "",

                                        category:
                                            item["Category"] || "",

                                        additional_info:
                                            item["Additional Information"] || "",

                                        pic:
                                            item["PIC"] || "",

                                        support:
                                            item["Support"] || "",

                                        original_due:
                                            excelDateToJSDate(
                                                item["Original due date"]
                                            ),

                                        revised_due:
                                            excelDateToJSDate(
                                                item["Revised due date"]
                                            ),

                                        status:

                                            item["OA-PR#"] &&
                                                item["PR.NO"] &&
                                                item["PO"]

                                                ? "Done"

                                                : "Ongoing",

                                        psc: "NA"

                                    };

                                })

                                .filter((item) => {

                                    // ====================================
                                    // REQUIRED VALIDATION
                                    // ====================================

                                    if (

                                        String(item.oa_pr).trim() === "" ||
                                        String(item.io).trim() === "" ||
                                        String(item.cost_center).trim() === "" ||
                                        String(item.description).trim() === "" ||
                                        String(item.qty).trim() === "" ||
                                        String(item.oum).trim() === "" ||
                                        String(item.price).trim() === "" ||
                                        String(item.total_cost).trim() === "" ||
                                        String(item.vendor).trim() === "" ||
                                        String(item.additional_info).trim() === "" ||
                                        String(item.pic).trim() === ""

                                    ) {

                                        console.log(
                                            "SKIP EMPTY",
                                            item
                                        );

                                        return false;

                                    }

                                    // ====================================
                                    // DUPLICATE CHECK
                                    // ====================================

                                    const duplicateDb =
                                        requests.find(
                                            (x) =>

                                                normalizeText(x.oa_pr) ===
                                                normalizeText(item.oa_pr)

                                                &&

                                                normalizeText(x.description) ===
                                                normalizeText(item.description)
                                        );

                                    if (duplicateDb) {

                                        duplicateList.push(
                                            `OA-PR: ${item.oa_pr}
Description: ${item.description}`
                                        );

                                        return false;

                                    }

                                    return true;

                                });

                        // ====================================
                        // NO DATA TO IMPORT
                        // ====================================

                        if (
                            formatted.length === 0
                        ) {

                            let message =
                                "No new data imported.";

                            if (
                                duplicateList.length > 0
                            ) {

                                message +=
                                    "\n\nDuplicate Data:\n\n" +
                                    duplicateList.join(
                                        "\n\n"
                                    );

                            }

                            alert(message);

                            e.target.value = "";

                            return;

                        }

                        // ====================================
                        // INSERT DATABASE
                        // ====================================

                        const {
                            error
                        } =
                            await supabase
                                .from("request_list")
                                .insert(formatted);

                        if (error) {

                            console.log(error);

                            alert(
                                "Import failed"
                            );

                            e.target.value = "";

                            return;

                        }

                        await loadRequests();

                        // ====================================
                        // SUCCESS MESSAGE
                        // ====================================

                        let successMessage =
                            `Import success: ${formatted.length} row`;

                        if (
                            duplicateList.length > 0
                        ) {

                            successMessage +=
                                `\n\nSkipped Duplicate: ${duplicateList.length}\n\n`;

                            successMessage +=
                                duplicateList.join(
                                    "\n\n"
                                );

                        }

                        alert(successMessage);

                        // ====================================
                        // RESET INPUT FILE
                        // ====================================

                        e.target.value = "";

                    }

                    catch (err) {

                        console.log(err);

                        alert(
                            "Excel read failed"
                        );

                        e.target.value = "";

                    }

                };

            reader.readAsBinaryString(
                file
            );

        };

    // ========================================
    // DELETE
    // ========================================

    const handleDelete =
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Delete this row?"
                );

            if (!confirmDelete)
                return;

            const {
                error
            } =
                await supabase
                    .from("request_list")
                    .delete()
                    .eq("id", id);

            if (error) {

                console.log(error);

                alert(
                    "Delete failed"
                );

                return;

            }

            await loadRequests();

        };

    // ========================================
    // EDIT
    // ========================================

    const handleEdit =
        (item) => {

            setEditingItem(item);

            setEditForm({

                oa_pr:
                    item.oa_pr || "",

                pr_no:
                    item.pr_no || "",

                po:
                    item.po || "",

                io:
                    item.io || "",

                cost_center:
                    item.cost_center || "",

                description:
                    item.description || "",

                qty:
                    item.qty || "",

                oum:
                    item.oum || "",

                price:
                    item.price || "",

                total_cost:
                    item.total_cost || "",

                vendor:
                    item.vendor || "",

                additional_info:
                    item.additional_info || "",

                pic:
                    item.pic || "",

                original_due:
                    item.original_due || "",

                revised_due:
                    item.revised_due || "",

                status:
                    item.status || "",

                psc:
                    item.psc || "NA"

            });

        };

    const handleSaveEdit =
        async () => {

            const updatedStatus =

                editForm.oa_pr &&
                    editForm.pr_no &&
                    editForm.po

                    ? "Done"

                    : "Ongoing";

            const {
                error
            } =
                await supabase
                    .from("request_list")
                    .update({

                        ...editForm,

                        status:
                            updatedStatus

                    })
                    .eq(
                        "id",
                        editingItem.id
                    );

            if (error) {

                console.log(error);

                alert(
                    "Update failed"
                );

                return;

            }

            await loadRequests();

            setEditingItem(null);

            alert(
                "Update success"
            );

        };

    const handleAddRequest =
        async () => {

            // ====================================
            // REQUIRED VALIDATION
            // ====================================

            if (

                !addForm.oa_pr ||
                !addForm.io ||
                !addForm.cost_center ||
                !addForm.description ||
                !addForm.qty ||
                !addForm.oum ||
                !addForm.price ||
                !addForm.total_cost ||
                !addForm.vendor ||
                !addForm.additional_info ||
                !addForm.pic

            ) {

                alert(
                    `
                Please complete required fields:

                • OA-PR#
                • IO
                • Cost Center
                • Description
                • Qty
                • OUM
                • Price
                • Total Cost
                • Vendor
                • Project
                • PIC
                `
                );

                return;

            }

            // ====================================
            // CHECK DUPLICATE
            // ====================================

            const duplicate =
                requests.find(
                    (x) =>

                        normalizeText(x.oa_pr) ===
                        normalizeText(addForm.oa_pr)

                        &&

                        normalizeText(x.description) ===
                        normalizeText(addForm.description)
                );

            if (duplicate) {

                alert(
                    "Duplicate OA-PR# and Description detected"
                );

                return;

            }

            const status =

                addForm.oa_pr &&
                    addForm.pr_no &&
                    addForm.po

                    ? "Done"

                    : "Ongoing";

            const {
                error
            } =
                await supabase
                    .from("request_list")
                    .insert([{

                        ...addForm,

                        status

                    }]);

            if (error) {

                console.log(error);

                alert("Add request failed");

                return;

            }

            await loadRequests();

            setShowAddModal(false);

            setAddForm({

                oa_pr: "",
                pr_no: "",
                po: "",
                io: "",
                cost_center: "",
                description: "",
                qty: "",
                oum: "",
                price: "",
                total_cost: "",
                vendor: "",
                additional_info: "",
                pic: "",
                original_due: "",
                revised_due: "",
                status: "Ongoing",
                psc: "NA"

            });

            alert("Add request success");

        };
    // ========================================
    // FILTER
    // ========================================

    const filteredRequests =
        requests.filter((item) => {

            const keyword =
                search.toLowerCase();

            const searchMatch = (

                item.oa_pr
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.pr_no
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.po
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.description
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.vendor
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.pic
                    ?.toLowerCase()
                    .includes(keyword)

            );



            let summaryMatch = true;

            // ====================================
            // MULTI FILTER
            // ====================================

            if (summaryFilter.length > 0) {

                summaryMatch = false;

                if (
                    summaryFilter.includes("OVERDUE") &&
                    item.status === "Delay"
                ) {

                    summaryMatch = true;

                }

                if (
                    summaryFilter.includes("ONGOING") &&
                    item.status === "Ongoing"
                ) {

                    summaryMatch = true;

                }

                if (
                    summaryFilter.includes("DONE") &&
                    item.status === "Done"
                ) {

                    summaryMatch = true;

                }

                if (
                    summaryFilter.includes("CANCELLED") &&
                    item.status === "Cancelled"
                ) {

                    summaryMatch = true;

                }

                if (
                    summaryFilter.includes("PSC") &&
                    item.psc === "Not Yet"
                ) {

                    summaryMatch = true;

                }

            }

            return (
                searchMatch &&
                summaryMatch
            );
        });

    // ========================================
    // SUMMARY
    // ========================================

    const overdueCount =
        requests.filter(
            (x) =>
                x.status === "Delay"
        ).length;

    const ongoingCount =
        requests.filter(
            (x) =>
                x.status === "Ongoing"
        ).length;

    const doneCount =
        requests.filter(
            (x) =>
                x.status === "Done"
        ).length;

    const cancelCount =
        requests.filter(
            (x) =>
                x.status === "Cancelled"
        ).length;

    const pscNotCompleteCount =
        requests.filter(
            (x) =>
                x.psc === "Not Yet"
        ).length;

    return (

        <div className="
            p-6
            text-white
        ">

            {/* ======================================== */}
            {/* HEADER */}
            {/* ======================================== */}

            <div className="
                flex
                items-center
                justify-between
                mb-6
            ">

                <div>

                    <h1 className="
                        text-4xl
                        font-black
                    ">
                        Request List
                    </h1>

                    <p className="
                        text-slate-400
                        mt-2
                    ">
                        PR / PO Monitoring System
                    </p>

                </div>

                <div className="
                    flex
                    items-center
                    gap-3
                ">

                    <button
                        onClick={() =>
                            setShowAddModal(true)
                        }
                        className="
                            px-5
                            py-3
                            rounded-2xl
                            bg-cyan-500
                            hover:bg-cyan-400
                            flex
                            items-center
                            gap-2
                            font-bold
                            transition
                        "
                    >

                        <Plus size={18} />

                        Add Request

                    </button>

                    <label className="
                        px-5
                        py-3
                        rounded-2xl
                        bg-emerald-500
                        hover:bg-emerald-400
                        flex
                        items-center
                        gap-2
                        font-bold
                        cursor-pointer
                        transition
                    ">

                        <Upload size={18} />

                        Import Excel

                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            hidden
                            onChange={
                                handleImportExcel
                            }
                        />

                    </label>

                </div>

            </div>

            {/* ======================================== */}
            {/* SUMMARY */}
            {/* ======================================== */}

            <div className="
                grid
                grid-cols-5
                gap-4
                mb-6
            ">
                <SummaryCard
                    onClick={() =>
                        handleSummaryFilter("PSC")
                    }
                    active={
                        summaryFilter.includes("PSC")
                    }
                    title="PSC Not Complete"
                    value={pscNotCompleteCount}
                    color="orange"
                    icon={
                        <AlertTriangle />
                    }
                />

                <SummaryCard
                    onClick={() =>
                        handleSummaryFilter("OVERDUE")
                    }
                    active={
                        summaryFilter.includes("OVERDUE")
                    }
                    title="PR/PO Overdue"
                    value={overdueCount}
                    color="red"
                    icon={
                        <AlertTriangle />
                    }
                />

                <SummaryCard
                    onClick={() =>
                        handleSummaryFilter("ONGOING")
                    }
                    active={
                        summaryFilter.includes("ONGOING")
                    }
                    title="PR/PO Ongoing"
                    value={ongoingCount}
                    color="yellow"
                    icon={
                        <Clock3 />
                    }
                />

                <SummaryCard
                    onClick={() =>
                        handleSummaryFilter("DONE")
                    }
                    active={
                        summaryFilter.includes("DONE")
                    }
                    title="PR/PO Done"
                    value={doneCount}
                    color="emerald"
                    icon={
                        <CheckCircle2 />
                    }
                />

                <SummaryCard
                    onClick={() =>
                        handleSummaryFilter("CANCELLED")
                    }
                    active={
                        summaryFilter.includes("CANCELLED")
                    }
                    title="PR/PO Cancelled"
                    value={cancelCount}
                    color="purple"
                    icon={
                        <XCircle />
                    }
                />

            </div>

            {/* ======================================== */}
            {/* SEARCH */}
            {/* ======================================== */}

            <div className="
                relative
                mb-5
            ">

                <Search
                    className="
                        absolute
                        left-4
                        top-4
                        text-slate-500
                    "
                    size={18}
                />

                <input
                    type="text"
                    placeholder=" Search OA-PR#, PR, PO, Vendor, PIC..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        h-12
                        rounded-2xl
                        bg-slate-900/60
                        border
                        border-slate-800
                        pl-12
                        pr-4
                        outline-none
                        text-sm
                    "
                />

            </div>

            {/* ======================================== */}
            {/* TABLE */}
            {/* ======================================== */}

            <div className="
                overflow-auto
                rounded-3xl
                border
                border-slate-800
                max-h-[70vh]
            ">

                <table className="
                    min-w-full
                    text-sm
                ">

                    <thead className="
                        sticky
                        top-0
                        z-20
                        bg-slate-900
                        text-cyan-300
                    ">

                        <tr>

                            <th className="p-3">
                                OA-PR#
                            </th>

                            <th className="p-3">
                                PR.NO
                            </th>

                            <th className="p-3">
                                PO
                            </th>

                            <th className="p-3">
                                IO
                            </th>

                            <th className="p-3">
                                Cost Center
                            </th>

                            <th className="p-3">
                                Description
                            </th>

                            <th className="p-3">
                                Qty
                            </th>

                            <th className="p-3">
                                OUM
                            </th>

                            <th className="p-3">
                                Price
                            </th>

                            <th className="p-3">
                                Total
                            </th>

                            <th className="p-3">
                                Vendor
                            </th>

                            <th className="p-3">
                                Project
                            </th>

                            <th className="p-3">
                                PIC
                            </th>

                            <th className="p-3">
                                Original Due
                            </th>

                            <th className="p-3">
                                Revised Due
                            </th>

                            <th className="p-3">
                                PSC
                            </th>

                            <th className="p-3">
                                Status
                            </th>



                            <th className="p-3">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            filteredRequests.map(
                                (item) => {

                                    return (

                                        <tr
                                            key={item.id}
                                            className="
                                                border-t
                                                border-slate-800
                                                hover:bg-cyan-500/5
                                                transition
                                            "
                                        >

                                            <td className="p-3">
                                                {item.oa_pr}
                                            </td>

                                            <td className="p-3">
                                                {item.pr_no}
                                            </td>

                                            <td className="p-3">
                                                {item.po}
                                            </td>

                                            <td className="p-3">
                                                {item.io}
                                            </td>

                                            <td className="p-3">
                                                {item.cost_center}
                                            </td>

                                            <td className="
                                                p-3
                                                min-w-[300px]
                                            ">
                                                {item.description}
                                            </td>

                                            <td className="p-3">
                                                {item.qty}
                                            </td>

                                            <td className="p-3">
                                                {item.oum}
                                            </td>

                                            <td className="p-3">
                                                {item.price}
                                            </td>

                                            <td className="p-3">
                                                {item.total_cost}
                                            </td>

                                            <td className="p-3">
                                                {item.vendor}
                                            </td>

                                            <td className="p-3">
                                                {item.additional_info}
                                            </td>

                                            <td className="p-3">
                                                {item.pic}
                                            </td>

                                            <td className="
                                                p-3
                                                whitespace-nowrap
                                            ">

                                                {
                                                    item.original_due
                                                        ? excelDateToJSDate(
                                                            item.original_due
                                                        )
                                                        : "-"
                                                }

                                            </td>

                                            <td className="
                                                p-3
                                                whitespace-nowrap
                                            ">

                                                {
                                                    item.revised_due
                                                        ? excelDateToJSDate(
                                                            item.revised_due
                                                        )
                                                        : "-"
                                                }

                                            </td>

                                            <td className="p-3">

                                                <span
                                                    className={`
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-bold

                                                        ${item.psc ===
                                                            "Done"

                                                            ? "bg-emerald-500/20 text-emerald-400"

                                                            : item.psc ===
                                                                "Not Yet"

                                                                ? "bg-red-500/20 text-red-400"

                                                                : item.psc ===
                                                                    "NA"

                                                                    ? "bg-purple-500/20 text-purple-400"

                                                                    : "bg-yellow-500/20 text-yellow-400"
                                                        }
                                                    `}
                                                >

                                                    {
                                                        item.psc === "Not Yet"
                                                            ? "NY"

                                                            : item.psc === "Done"
                                                                ? "OK"

                                                                : item.psc
                                                    }

                                                </span>

                                            </td>

                                            <td className="p-3">

                                                <span
                                                    className={`
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-bold

                                                        ${item.status ===
                                                            "Done"

                                                            ? "bg-emerald-500/20 text-emerald-400"

                                                            : item.status ===
                                                                "Delay"

                                                                ? "bg-red-500/20 text-red-400"

                                                                : item.status ===
                                                                    "Cancelled"

                                                                    ? "bg-purple-500/20 text-purple-400"

                                                                    : "bg-yellow-500/20 text-yellow-400"
                                                        }
                                                    `}
                                                >

                                                    {
                                                        item.status
                                                    }

                                                </span>

                                            </td>



                                            <td className="p-3">

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                ">

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                        className="
                                                            w-9
                                                            h-9
                                                            rounded-xl
                                                            border
                                                            border-yellow-500/30
                                                            bg-yellow-500/10
                                                            hover:bg-yellow-500/20
                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                    >

                                                        <Pencil
                                                            size={16}
                                                            className="
                                                                text-yellow-400
                                                            "
                                                        />

                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                        className="
                                                            w-9
                                                            h-9
                                                            rounded-xl
                                                            border
                                                            border-red-500/30
                                                            bg-red-500/10
                                                            hover:bg-red-500/20
                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                    >

                                                        <Trash2
                                                            size={16}
                                                            className="
                                                                text-red-400
                                                            "
                                                        />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                }
                            )
                        }

                    </tbody>

                </table>

            </div>
            {
                showAddModal && (

                    <div className="
                        fixed
                        inset-0
                        bg-black/70
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        z-50
                    ">

                        <div className="
                            w-[900px]
                            max-h-[90vh]
                            overflow-auto
                            rounded-3xl
                            border
                            border-cyan-500/20
                            bg-[#071126]
                            p-6
                        ">

                            <div className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-6
                                ">

                                <h1 className="
                                    text-3xl
                                    font-black
                                ">
                                    Add Request
                                </h1>

                                <button
                                    onClick={() =>
                                        setShowAddModal(false)
                                    }
                                    className="
                                        w-10
                                        h-10
                                        rounded-xl
                                        bg-slate-800
                                    "
                                >
                                    ✕
                                </button>

                            </div>

                            <div className="
                                    grid
                                    grid-cols-2
                                    gap-4
                                ">

                                {
                                    Object.keys(addForm)
                                        .map((key) => {
                                            if (
                                                key === "psc"
                                            ) {

                                                return (

                                                    <div key={key}>

                                                        <p className="
                                                            text-sm
                                                            text-slate-400
                                                            mb-2
                                                        ">
                                                            PSC
                                                        </p>

                                                        <select
                                                            value={
                                                                addForm[key]
                                                            }
                                                            onChange={(e) =>
                                                                setAddForm({

                                                                    ...addForm,

                                                                    [key]:
                                                                        e.target.value

                                                                })
                                                            }
                                                            className="
                                                                w-full
                                                                h-12
                                                                rounded-2xl
                                                                bg-slate-900
                                                                border
                                                                border-slate-700
                                                                px-4
                                                                outline-none
                                                                text-white
                                                            "
                                                        >

                                                            <option>
                                                                Not Yet
                                                            </option>

                                                            <option>
                                                                Done
                                                            </option>

                                                            <option>
                                                                NA
                                                            </option>

                                                        </select>

                                                    </div>

                                                );

                                            }

                                            if (
                                                key === "status"
                                            ) return null;

                                            return (

                                                <div key={key}>

                                                    <p className="
                                                        text-sm
                                                        text-slate-400
                                                        mb-2
                                                    ">
                                                        {key}
                                                    </p>



                                                    <input
                                                        type={
                                                            key === "original_due" ||
                                                                key === "revised_due"

                                                                ? "date"

                                                                : "text"
                                                        }
                                                        value={
                                                            key === "original_due" ||
                                                                key === "revised_due"

                                                                ? (
                                                                    addForm[key]
                                                                        ? new Date(addForm[key])
                                                                            .toISOString()
                                                                            .split("T")[0]
                                                                        : ""
                                                                )

                                                                : addForm[key]
                                                        }
                                                        onChange={(e) =>
                                                            setAddForm({

                                                                ...addForm,

                                                                [key]:
                                                                    e.target.value

                                                            })
                                                        }
                                                        className="
                                                            w-full
                                                            h-12
                                                            rounded-2xl
                                                            bg-slate-900
                                                            border
                                                            border-slate-700
                                                            px-4
                                                            outline-none
                                                            text-white
                                                        "
                                                    />

                                                </div>

                                            );

                                        })
                                }

                            </div>

                            <div className="
                                    flex
                                    justify-end
                                    gap-3
                                    mt-6
                                ">

                                <button
                                    onClick={() =>
                                        setShowAddModal(false)
                                    }
                                    className="
                                        px-5
                                        py-3
                                        rounded-2xl
                                        bg-slate-700
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        handleAddRequest
                                    }
                                    className="
                                        px-5
                                        py-3
                                        rounded-2xl
                                        bg-cyan-500
                                        font-bold
                                    "
                                >
                                    Save Request
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }
            {
                editingItem && (

                    <div className="
            fixed
            inset-0
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
        ">

                        <div className="
                w-[900px]
                max-h-[90vh]
                overflow-auto
                rounded-3xl
                border
                border-cyan-500/20
                bg-[#071126]
                p-6
            ">

                            <div className="
                    flex
                    items-center
                    justify-between
                    mb-6
                ">

                                <h1 className="
                        text-3xl
                        font-black
                    ">
                                    Edit Request
                                </h1>

                                <button
                                    onClick={() =>
                                        setEditingItem(null)
                                    }
                                    className="
                            w-10
                            h-10
                            rounded-xl
                            bg-slate-800
                        "
                                >
                                    ✕
                                </button>

                            </div>

                            <div className="
                    grid
                    grid-cols-2
                    gap-4
                ">

                                {
                                    Object.keys(editForm)
                                        .map((key) => {

                                            // =====================================
                                            // HIDE STATUS
                                            // =====================================

                                            if (
                                                key === "status"
                                            ) {

                                                return null;

                                            }

                                            // =====================================
                                            // PSC DROPDOWN
                                            // =====================================

                                            if (
                                                key === "psc"
                                            ) {

                                                return (

                                                    <div
                                                        key={key}
                                                    >

                                                        <p className="
                                                text-sm
                                                text-slate-400
                                                mb-2
                                            ">
                                                            PSC
                                                        </p>

                                                        <select
                                                            value={
                                                                editForm[key]
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm({

                                                                    ...editForm,

                                                                    [key]:
                                                                        e.target.value

                                                                })
                                                            }
                                                            className="
                                                    w-full
                                                    h-12
                                                    rounded-2xl
                                                    bg-slate-900
                                                    border
                                                    border-slate-700
                                                    px-4
                                                    outline-none
                                                    text-white
                                                "
                                                        >

                                                            <option>
                                                                Not Yet
                                                            </option>

                                                            <option>
                                                                Done
                                                            </option>

                                                            <option>
                                                                NA
                                                            </option>

                                                        </select>

                                                    </div>

                                                );

                                            }

                                            return (

                                                <div
                                                    key={key}
                                                >

                                                    <p className="
                                            text-sm
                                            text-slate-400
                                            mb-2
                                        ">
                                                        {key}
                                                    </p>

                                                    <input
                                                        type={
                                                            key === "original_due" ||
                                                                key === "revised_due"

                                                                ? "date"

                                                                : "text"
                                                        }
                                                        value={
                                                            key === "original_due" ||
                                                                key === "revised_due"

                                                                ? (

                                                                    editForm[key]

                                                                        ? new Date(
                                                                            editForm[key]
                                                                        )
                                                                            .toISOString()
                                                                            .split("T")[0]

                                                                        : ""

                                                                )

                                                                : editForm[key]
                                                        }
                                                        onChange={(e) =>
                                                            setEditForm({

                                                                ...editForm,

                                                                [key]:
                                                                    e.target.value

                                                            })
                                                        }
                                                        className="
                                                w-full
                                                h-12
                                                rounded-2xl
                                                bg-slate-900
                                                border
                                                border-slate-700
                                                px-4
                                                outline-none
                                                text-white
                                            "
                                                    />

                                                </div>

                                            );

                                        })
                                }

                            </div>

                            <div className="
                    flex
                    justify-end
                    gap-3
                    mt-6
                ">

                                <button
                                    onClick={() =>
                                        setEditingItem(null)
                                    }
                                    className="
                            px-5
                            py-3
                            rounded-2xl
                            bg-slate-700
                        "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        handleSaveEdit
                                    }
                                    className="
                            px-5
                            py-3
                            rounded-2xl
                            bg-cyan-500
                            font-bold
                        "
                                >
                                    Save Update
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }
        </div>

    );

}

// ========================================
// SUMMARY CARD
// ========================================

function SummaryCard({

    title,
    value,
    color,
    icon,
    onClick,
    active

}) {

    return (

        <div
            onClick={onClick}
            className={`
            rounded-3xl
            border
            p-5
            cursor-pointer
            transition
            hover:scale-[1.02]

            ${active
                    ? "ring-2 ring-cyan-400"
                    : ""
                }

            ${color === "red"
                    ? "border-red-500/30 bg-red-500/10"
                    : ""

                }

            ${color === "yellow"
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : ""

                }

            ${color === "emerald"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : ""

                }

            ${color === "purple"
                    ? "border-purple-500/30 bg-purple-500/10"
                    : ""

                }

            ${color === "orange"
                    ? "border-orange-500/30 bg-orange-500/10"
                    : ""
                }

        `}>

            <div className="
                flex
                items-center
                justify-between
            ">

                <div>

                    <p className="
                        text-sm
                        text-slate-300
                    ">
                        {title}
                    </p>

                    <h1 className="
                        text-4xl
                        font-black
                        mt-2
                    ">
                        {value}
                    </h1>

                </div>

                <div className="
                    text-white
                ">
                    {icon}
                </div>

            </div>

        </div>

    );

}