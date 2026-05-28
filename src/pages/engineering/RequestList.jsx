import React, {
    useEffect,
    useState
} from "react";

import { supabase }
    from "../../supabase/supabase";

import * as XLSX from "xlsx";

import {
    Upload,
    Download,
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

// ========================================
// FORMAT RUPIAH
// ========================================

const formatRupiah = (
    value
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "0";

    }

    const number =
        Number(
            String(value)
                .replace(/\./g, "")
                .replace(/,/g, "")
        );

    return number.toLocaleString(
        "id-ID"
    );

};

// ========================================
// PARSE NUMBER
// ========================================

const parseNumber = (
    value
) => {

    if (!value)
        return 0;

    return Number(
        String(value)
            .replace(/\./g, "")
            .replace(/,/g, "")
    ) || 0;

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
            category: "",
            additional_info: "",
            pic: "",
            original_due: "",
            revised_due: "",
            status: "Ongoing",
            psc: "NA"

        });

    const currentUser =
        JSON.parse(
            localStorage.getItem("user")
        );

    const isManagerOrAdmin =

        currentUser?.role === "Manager"

        ||

        currentUser?.role === "Admin";
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
            // FORCE SAME FILE REIMPORT
            e.target.value = null;

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
                                            parseNumber(
                                                item["Qty"]
                                            ),

                                        oum:
                                            item["OUM"] || "",

                                        price:
                                            formatRupiah(
                                                parseNumber(
                                                    item["Price"]
                                                )
                                            ),

                                        total_cost:
                                            formatRupiah(

                                                parseNumber(
                                                    item["Qty"]
                                                )

                                                *

                                                parseNumber(
                                                    item["Price"]
                                                )

                                            ),

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
                                        String(item.pic).trim() === ""

                                    ) {

                                        console.log(
                                            "SKIP EMPTY",
                                            item
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

                            alert(
                                "No valid data to import"
                            );

                            e.target.value = null;

                            return;

                        }

                        // ====================================
                        // LOAD EXISTING DATABASE
                        // ====================================

                        const {
                            data: existingData,
                            error: existingError
                        } = await supabase
                            .from("request_list")
                            .select("*");

                        if (existingError) {

                            console.log(existingError);

                            alert("Failed load database");

                            return;

                        }

                        // ====================================
                        // CREATE MAP
                        // ====================================

                        const existingMap =
                            new Map();

                        existingData.forEach((row) => {

                            const key =
                                [
                                    normalizeText(row.oa_pr),
                                    normalizeText(row.description)
                                ].join("_");

                            existingMap.set(
                                key,
                                row
                            );

                        });

                        // ====================================
                        // SPLIT INSERT & UPDATE
                        // ====================================

                        const insertData = [];
                        const updateData = [];

                        formatted.forEach((row) => {

                            const key =
                                [
                                    normalizeText(row.oa_pr),
                                    normalizeText(row.description)
                                ].join("_");

                            const existing =
                                existingMap.get(key);

                            const oaDate =
                                row.oa_pr
                                    ?.replace("PR", "")
                                    ?.substring(0, 8);

                            const year =
                                oaDate?.substring(0, 4);

                            const month =
                                oaDate?.substring(4, 6);

                            const day =
                                oaDate?.substring(6, 8);

                            const createdDate =
                                new Date(
                                    `${year}-${month}-${day}`
                                );

                            const today =
                                new Date();

                            const diffDays =
                                Math.floor(
                                    (
                                        today - createdDate
                                    ) / (1000 * 60 * 60 * 24)
                                );

                            // ====================================
                            // STATUS LOGIC
                            // ====================================

                            if (
                                row.pr_no &&
                                row.po
                            ) {

                                row.status = "Done";

                            }

                            else if (
                                diffDays > 10
                            ) {

                                row.status = "Delay";

                            }

                            else {

                                row.status = "Ongoing";

                            }

                            // ====================================
                            // UPDATE EXISTING
                            // ====================================

                            if (existing) {

                                let changed =
                                    false;

                                Object.keys(row).forEach((field) => {

                                    const oldVal =
                                        existing[field] ?? "";

                                    const newVal =
                                        row[field] ?? "";

                                    if (
                                        String(oldVal)
                                        !==
                                        String(newVal)
                                    ) {

                                        changed = true;

                                    }

                                });

                                if (changed) {

                                    updateData.push({
                                        id: existing.id,
                                        ...row
                                    });

                                }

                            }

                            // ====================================
                            // INSERT NEW
                            // ====================================

                            else {

                                insertData.push(row);

                            }

                        });

                        // ====================================
                        // INSERT NEW DATA
                        // ====================================

                        if (insertData.length > 0) {

                            const {
                                error: insertError
                            } = await supabase
                                .from("request_list")
                                .insert(insertData);

                            if (insertError) {

                                console.log(insertError);

                            }

                        }

                        // ====================================
                        // UPDATE EXISTING DATA
                        // ====================================

                        for (const row of updateData) {

                            const {
                                id,
                                ...payload
                            } = row;

                            const {
                                error: updateError
                            } = await supabase
                                .from("request_list")
                                .update(payload)
                                .eq("id", id);

                            if (updateError) {

                                console.log(updateError);

                            }

                        }

                        // ====================================
                        // RELOAD DATA
                        // ====================================

                        await loadRequests();

                        // ====================================
                        // SUCCESS MESSAGE
                        // ====================================

                        let successMessage =
                            `
                        Import Success

                        Insert : ${insertData.length}
                        Update : ${updateData.length}
                        `;


                        alert(successMessage);

                        // ====================================
                        // RESET INPUT FILE
                        // ====================================

                        e.target.value = null;

                    }

                    catch (err) {

                        console.log(err);

                        alert(
                            "Excel read failed"
                        );

                        e.target.value = null;

                    }

                };

            reader.readAsBinaryString(
                file
            );

        };

    // ========================================
    // EXPORT EXCEL
    // ========================================

    const handleExportExcel =
        () => {

            // ====================================
            // FORMAT EXPORT
            // ====================================

            const exportData =
                requests.map((item) => {

                    return {

                        "OA-PR#":
                            item.oa_pr || "",

                        "PR.NO":
                            item.pr_no || "",

                        "PO":
                            item.po || "",

                        "IO":
                            item.io || "",

                        "Cost center":
                            item.cost_center || "",

                        "Description":
                            item.description || "",

                        "Qty":
                            item.qty || "",

                        "OUM":
                            item.oum || "",

                        "Price":
                            item.price || "",

                        "Total Cost":
                            item.total_cost || "",

                        "Code Vendor":
                            item.vendor_code || "",

                        "Vendor":
                            item.vendor || "",

                        "Category":
                            item.category || "",

                        "Additional Information":
                            item.additional_info || "",

                        "PIC":
                            item.pic || "",

                        "Support":
                            item.support || "",

                        "Original due date":
                            item.original_due || "",

                        "Revised due date":
                            item.revised_due || "",

                        "Status":
                            item.status || ""

                    };

                });

            // ====================================
            // CREATE WORKBOOK
            // ====================================

            const worksheet =
                XLSX.utils.json_to_sheet(
                    exportData
                );

            const workbook =
                XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(

                workbook,
                worksheet,
                "Request List"

            );

            // ====================================
            // AUTO COLUMN WIDTH
            // ====================================

            worksheet["!cols"] = [

                { wch: 18 }, // OA-PR#
                { wch: 15 }, // PR.NO
                { wch: 15 }, // PO
                { wch: 12 }, // IO
                { wch: 15 }, // Cost center
                { wch: 45 }, // Description
                { wch: 10 }, // Qty
                { wch: 10 }, // OUM
                { wch: 15 }, // Price
                { wch: 18 }, // Total Cost
                { wch: 15 }, // Vendor Code
                { wch: 28 }, // Vendor
                { wch: 18 }, // Category
                { wch: 30 }, // Additional Info
                { wch: 15 }, // PIC
                { wch: 12 }, // Support
                { wch: 18 }, // Original Due
                { wch: 18 }, // Revised Due
                { wch: 15 }  // Status

            ];

            // ====================================
            // EXPORT FILE
            // ====================================

            XLSX.writeFile(

                workbook,

                `REQUEST_LIST_${new Date()
                    .toISOString()
                    .split("T")[0]}.xlsx`

            );

        };

    // ========================================
    // DELETE ALL
    // ========================================

    const handleDeleteAll =
        async () => {

            const confirmDelete =
                window.confirm(
                    "DELETE ALL REQUEST LIST DATA ?"
                );

            if (!confirmDelete)
                return;

            const secondConfirm =
                window.confirm(
                    "THIS ACTION CANNOT BE UNDONE !!!"
                );

            if (!secondConfirm)
                return;

            const {
                error
            } = await supabase
                .from("request_list")
                .delete()
                .neq("id", 0);

            if (error) {

                console.log(error);

                alert(
                    "Delete all failed"
                );

                return;

            }

            await loadRequests();

            alert(
                "All request deleted"
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

                category:
                    item.category || "",

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

            const autoTotal =

                parseNumber(editForm.qty)

                *

                parseNumber(editForm.price);

            const oaDate =
                editForm.oa_pr
                    ?.replace("PR", "")
                    ?.substring(0, 8);

            const year =
                oaDate?.substring(0, 4);

            const month =
                oaDate?.substring(4, 6);

            const day =
                oaDate?.substring(6, 8);

            const createdDate =
                new Date(
                    `${year}-${month}-${day}`
                );

            const today =
                new Date();

            const diffDays =
                Math.floor(
                    (
                        today - createdDate
                    ) / (1000 * 60 * 60 * 24)
                );

            let updatedStatus =
                "Ongoing";

            if (
                editForm.pr_no &&
                editForm.po
            ) {

                updatedStatus = "Done";

            }

            else if (
                diffDays > 10
            ) {

                updatedStatus = "Delay";

            }

            const {
                error
            } =
                await supabase
                    .from("request_list")
                    .update({

                        ...editForm,

                        price:
                            formatRupiah(
                                parseNumber(
                                    editForm.price
                                )
                            ),

                        total_cost:
                            formatRupiah(
                                autoTotal
                            ),

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
                • Additional Info
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

            const autoTotal =

                parseNumber(addForm.qty)

                *

                parseNumber(addForm.price);

            const oaDate =
                addForm.oa_pr
                    ?.replace("PR", "")
                    ?.substring(0, 8);

            const year =
                oaDate?.substring(0, 4);

            const month =
                oaDate?.substring(4, 6);

            const day =
                oaDate?.substring(6, 8);

            const createdDate =
                new Date(
                    `${year}-${month}-${day}`
                );

            const today =
                new Date();

            const diffDays =
                Math.floor(
                    (
                        today - createdDate
                    ) / (1000 * 60 * 60 * 24)
                );

            let status =
                "Ongoing";

            if (
                addForm.pr_no &&
                addForm.po
            ) {

                status = "Done";

            }

            else if (
                diffDays > 10
            ) {

                status = "Delay";

            }

            const {
                error
            } =
                await supabase
                    .from("request_list")
                    .insert([{

                        ...addForm,
                        price:
                            formatRupiah(
                                parseNumber(
                                    addForm.price
                                )
                            ),

                        total_cost:
                            formatRupiah(
                                autoTotal
                            ),

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
                category: "",
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

                ||

                item.additional_info
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.cost_center
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
            p-8
            text-white
            min-h-screen
            bg-gradient-to-br
            from-[#020617]
            via-[#03112b]
            to-[#020617]
        ">

            {/* ======================================== */}
            {/* HEADER */}
            {/* ======================================== */}

            <div className="
                flex
                items-start
                justify-between
                mb-8
                rounded-[32px]
                border
                border-cyan-500/10
                bg-gradient-to-r
                from-cyan-500/5
                to-transparent
                backdrop-blur-xl
                p-8
                shadow-2xl
                shadow-cyan-500/5
            ">

                <div>

                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-2xl
                        border
                        border-cyan-500/20
                        bg-cyan-500/10
                        text-cyan-300
                        text-xs
                        font-bold
                        uppercase
                        tracking-[3px]
                        mb-4
                    ">

                        <div className="
                            w-2
                            h-2
                            rounded-full
                            bg-cyan-400
                            animate-pulse
                        " />

                        PR / PO MONITORING

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
                        Request List
                    </h1>

                    <p className="
                        text-slate-400
                        mt-3
                        text-lg
                    ">
                        Procurement request tracking & monitoring system
                    </p>

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
                flex
                items-center
                gap-3
                mb-5
            ">

                <div className="
                    relative
                    flex-1
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

                <button

                    onClick={() => {

                        if (!isManagerOrAdmin) {

                            alert(
                                "Only Manager or Admin can add request"
                            );

                            return;

                        }

                        setShowAddModal(true);

                    }}
                    className="
                        h-12
                        px-5
                        rounded-2xl
                        bg-cyan-500
                        hover:bg-cyan-400
                        flex
                        items-center
                        gap-2
                        font-bold
                        transition
                        whitespace-nowrap
                    "
                >

                    <Plus size={18} />

                    Add Request

                </button>

                <label
                    onClick={(e) => {

                        if (!isManagerOrAdmin) {

                            e.preventDefault();

                            alert(
                                "Only Manager or Admin can import excel"
                            );

                        }

                    }}
                    className={`
                        h-12
                        px-5
                        rounded-2xl
                        bg-emerald-500
                        hover:bg-emerald-400
                        flex
                        items-center
                        gap-2
                        font-bold
                        cursor-pointer
                        transition
                        whitespace-nowrap
                    `}
                >

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

                <button

                    onClick={() => {

                        if (!isManagerOrAdmin) {

                            alert(
                                "Only Manager or Admin can export excel"
                            );

                            return;

                        }

                        handleExportExcel();

                    }}
                    className="
                        h-12
                        px-5
                        rounded-2xl
                        bg-blue-600
                        hover:bg-blue-500
                        flex
                        items-center
                        gap-2
                        font-bold
                        whitespace-nowrap
                    "
                >

                    <Download size={18} />

                    Export Excel

                </button>
                <button

                    onClick={() => {

                        if (!isManagerOrAdmin) {

                            alert(
                                "Only Manager or Admin can delete all request"
                            );

                            return;

                        }

                        handleDeleteAll();

                    }}
                    className="
                        h-12
                        px-5
                        rounded-2xl
                        bg-red-600
                        hover:bg-red-500
                        flex
                        items-center
                        gap-2
                        font-bold
                        whitespace-nowrap
                    "
                >

                    <Trash2 size={18} />

                    Delete All

                </button>
            </div>

            {/* ======================================== */}
            {/* TABLE */}
            {/* ======================================== */}

            <div className="
                overflow-auto
                rounded-3xl
                border
                border-slate-800
                max-h-[50vh]
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
                                Category
                            </th>

                            <th className="p-3">
                                Additional Information
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
                                                {formatRupiah(item.price)}
                                            </td>

                                            <td className="p-3">
                                                {formatRupiah(item.total_cost)}
                                            </td>

                                            <td className="p-3">
                                                {item.vendor}
                                            </td>

                                            <td className="p-3">
                                                {item.category || "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.additional_info || "-"}
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

                                                        onClick={() => {

                                                            if (!isManagerOrAdmin) {

                                                                alert(
                                                                    "Only Manager or Admin can edit request"
                                                                );

                                                                return;

                                                            }

                                                            handleEdit(item);

                                                        }}
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

                                                        onClick={() => {

                                                            if (!isManagerOrAdmin) {

                                                                alert(
                                                                    "Only Manager or Admin can delete request"
                                                                );

                                                                return;

                                                            }

                                                            handleDelete(item.id);

                                                        }}
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