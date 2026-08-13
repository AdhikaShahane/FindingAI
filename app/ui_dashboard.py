"""
Finding AI — Main Application Window
Single-column scannable forensic workspace built on CustomTkinter.
"""

import os
import threading
import time
from datetime import datetime
from tkinter import filedialog, messagebox

import customtkinter as ctk
from PIL import Image, ImageTk

from . import theme
from . import forensics_utils as fu
from . import detection_engine as de
from . import feedback_manager as fm

try:
    from tkinterdnd2 import DND_FILES, TkinterDnD
    DND_AVAILABLE = True
except Exception:
    DND_AVAILABLE = False

ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output_scans")
os.makedirs(OUTPUT_DIR, exist_ok=True)

MAX_FILE_MB = 50
VALID_EXTS = (".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff")


class ChainOfCustodyStep:
    def __init__(self, label):
        self.label = label
        self.timestamp = None
        self.done = False


class FindingAIApp(ctk.CTk if not DND_AVAILABLE else TkinterDnD.Tk):
    """
    Note: if tkinterdnd2 is installed we mix in TkinterDnD.Tk for real native
    drag-and-drop; otherwise the app still runs fully via the file browser.
    """

    def __init__(self):
        super().__init__()
        theme.apply_base_theme()

        self.title("Finding AI — Advanced AI Image Forensics Platform")
        self.geometry("1180x820")
        self.minsize(980, 680)
        self.configure(fg_color=theme.DEEP_BLACK)
        try:
            icon_path = os.path.join(ASSETS_DIR, "icon.ico")
            if os.path.exists(icon_path):
                self.iconbitmap(icon_path)
        except Exception:
            pass

        self.current_filepath = None
        self.current_info = None
        self.current_result = None
        self.current_ela_mean = None
        self.custody_steps = []
        self.tk_image_refs = {}

        self._build_layout()
        self.show_page("workspace")

    # ---------------------------------------------------------------- layout
    def _build_layout(self):
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.sidebar = ctk.CTkFrame(self, width=220, fg_color=theme.SLATE_BLUE, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nswe")
        self.sidebar.grid_propagate(False)

        logo_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        logo_frame.pack(fill="x", pady=(22, 6), padx=16)
        logo_path = os.path.join(ASSETS_DIR, "icon.png")
        if os.path.exists(logo_path):
            pil_logo = Image.open(logo_path).resize((44, 44))
            ctk_logo = ctk.CTkImage(light_image=pil_logo, dark_image=pil_logo, size=(44, 44))
            ctk.CTkLabel(logo_frame, image=ctk_logo, text="").pack(side="left")
        title_box = ctk.CTkFrame(logo_frame, fg_color="transparent")
        title_box.pack(side="left", padx=10)
        ctk.CTkLabel(title_box, text="FINDING AI", font=theme.font(17, "bold"),
                     text_color=theme.ICE_WHITE).pack(anchor="w")
        ctk.CTkLabel(title_box, text="Truth Beyond Pixels", font=theme.font(10),
                     text_color=theme.MUTED_GRAY).pack(anchor="w")

        ctk.CTkFrame(self.sidebar, height=1, fg_color=theme.BORDER).pack(fill="x", pady=12, padx=12)

        self.nav_buttons = {}
        nav_items = [
            ("workspace", "🔍  Analysis Workspace"),
            ("monitoring", "📊  Model Monitoring"),
            ("ledger", "🗂  Feedback Ledger"),
            ("about", "ℹ️  About / Methodology"),
        ]
        for key, label in nav_items:
            btn = ctk.CTkButton(
                self.sidebar, text=label, anchor="w", height=42,
                fg_color="transparent", hover_color=theme.SLATE_BLUE_LIGHT,
                text_color=theme.ICE_WHITE, font=theme.font(13),
                command=lambda k=key: self.show_page(k),
            )
            btn.pack(fill="x", padx=10, pady=3)
            self.nav_buttons[key] = btn

        footer = ctk.CTkLabel(self.sidebar, text="Local simulated forensic engine\nNo cloud upload — 100% on-device",
                               font=theme.font(9), text_color=theme.MUTED_GRAY, justify="left")
        footer.pack(side="bottom", pady=16, padx=16, anchor="w")

        self.content_container = ctk.CTkFrame(self, fg_color=theme.DEEP_BLACK, corner_radius=0)
        self.content_container.grid(row=0, column=1, sticky="nswe")
        self.content_container.grid_rowconfigure(0, weight=1)
        self.content_container.grid_columnconfigure(0, weight=1)

        self.pages = {}
        self.pages["workspace"] = self._build_workspace_page()
        self.pages["monitoring"] = self._build_monitoring_page()
        self.pages["ledger"] = self._build_ledger_page()
        self.pages["about"] = self._build_about_page()

    def show_page(self, key):
        for k, page in self.pages.items():
            page.grid_forget()
        self.pages[key].grid(row=0, column=0, sticky="nswe")
        for k, btn in self.nav_buttons.items():
            btn.configure(fg_color=theme.ELECTRIC_BLUE if k == key else "transparent")
        if key == "monitoring":
            self._refresh_monitoring()
        if key == "ledger":
            self._refresh_ledger()

    # ------------------------------------------------------------ workspace
    def _build_workspace_page(self):
        page = ctk.CTkScrollableFrame(self.content_container, fg_color=theme.DEEP_BLACK,
                                       scrollbar_button_color=theme.SLATE_BLUE)
        page.grid_columnconfigure(0, weight=1)

        header = ctk.CTkLabel(page, text="Forensic Analysis Workspace", font=theme.font(24, "bold"),
                               text_color=theme.ICE_WHITE)
        header.grid(row=0, column=0, sticky="w", pady=(10, 2), padx=6)
        sub = ctk.CTkLabel(page, text="Ingest an image to run the multi-layer Evidence Fusion Engine.",
                            font=theme.font(12), text_color=theme.MUTED_GRAY)
        sub.grid(row=1, column=0, sticky="w", padx=6, pady=(0, 16))

        # ---- Ingest card ----
        self.ingest_card = ctk.CTkFrame(page, fg_color=theme.SLATE_BLUE, corner_radius=14, border_width=1,
                                         border_color=theme.BORDER, height=170)
        self.ingest_card.grid(row=2, column=0, sticky="ew", padx=6, pady=8)
        self.ingest_card.grid_propagate(False)
        self.ingest_card.grid_columnconfigure(0, weight=1)

        self.ingest_label = ctk.CTkLabel(
            self.ingest_card,
            text=("⬆  Drag & drop an image here, or click to browse\n(PNG, JPG, BMP, WEBP, TIFF — up to 50MB)"
                  if DND_AVAILABLE else
                  "⬆  Click below to browse for an image\n(PNG, JPG, BMP, WEBP, TIFF — up to 50MB)"),
            font=theme.font(13), text_color=theme.MUTED_GRAY, justify="center")
        self.ingest_label.place(relx=0.5, rely=0.35, anchor="center")

        browse_btn = ctk.CTkButton(self.ingest_card, text="Select Image File", width=180, height=38,
                                    fg_color=theme.ELECTRIC_BLUE, hover_color=theme.ELECTRIC_BLUE_HOVER,
                                    command=self._browse_file)
        browse_btn.place(relx=0.5, rely=0.72, anchor="center")

        if DND_AVAILABLE:
            self.ingest_card.drop_target_register(DND_FILES)
            self.ingest_card.dnd_bind("<<Drop>>", self._on_drop)

        # ---- File info card ----
        self.info_card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=1,
                                       border_color=theme.BORDER)
        self.info_card.grid(row=3, column=0, sticky="ew", padx=6, pady=8)
        self.info_card.grid_columnconfigure(1, weight=1)
        self.info_labels = {}
        self._build_info_card_contents()

        # ---- Chain of custody timeline ----
        self.custody_card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=1,
                                          border_color=theme.BORDER)
        self.custody_card.grid(row=4, column=0, sticky="ew", padx=6, pady=8)
        ctk.CTkLabel(self.custody_card, text="Chain of Custody", font=theme.font(15, "bold"),
                     text_color=theme.ICE_WHITE).pack(anchor="w", padx=16, pady=(12, 4))
        self.custody_list_frame = ctk.CTkFrame(self.custody_card, fg_color="transparent")
        self.custody_list_frame.pack(fill="x", padx=16, pady=(0, 14))

        # ---- Canvas views (original / edge / freq / ELA) ----
        self.canvas_card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=1,
                                         border_color=theme.BORDER)
        self.canvas_card.grid(row=5, column=0, sticky="ew", padx=6, pady=8)
        ctk.CTkLabel(self.canvas_card, text="Synchronized Canvas Views", font=theme.font(15, "bold"),
                     text_color=theme.ICE_WHITE).pack(anchor="w", padx=16, pady=(12, 4))
        self.canvas_tabs = ctk.CTkTabview(self.canvas_card, fg_color=theme.SLATE_BLUE,
                                           segmented_button_selected_color=theme.ELECTRIC_BLUE,
                                           segmented_button_selected_hover_color=theme.ELECTRIC_BLUE_HOVER)
        self.canvas_tabs.pack(fill="x", padx=16, pady=(0, 16))
        for tab_name in ["Original", "Edge / Geometry", "Frequency Spectrum", "ELA Heatmap"]:
            self.canvas_tabs.add(tab_name)
            self.canvas_tabs.tab(tab_name).grid_columnconfigure(0, weight=1)
        self.canvas_image_labels = {}
        for tab_name in ["Original", "Edge / Geometry", "Frequency Spectrum", "ELA Heatmap"]:
            lbl = ctk.CTkLabel(self.canvas_tabs.tab(tab_name), text="No image loaded", text_color=theme.MUTED_GRAY)
            lbl.grid(row=0, column=0, pady=30)
            self.canvas_image_labels[tab_name] = lbl

        # ---- Layer results ----
        self.layers_card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=1,
                                         border_color=theme.BORDER)
        self.layers_card.grid(row=6, column=0, sticky="ew", padx=6, pady=8)
        ctk.CTkLabel(self.layers_card, text="Evidence Fusion — Layer Breakdown", font=theme.font(15, "bold"),
                     text_color=theme.ICE_WHITE).pack(anchor="w", padx=16, pady=(12, 8))
        self.layers_inner = ctk.CTkFrame(self.layers_card, fg_color="transparent")
        self.layers_inner.pack(fill="x", padx=16, pady=(0, 16))

        # ---- Generator profile ----
        self.generator_card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=1,
                                            border_color=theme.BORDER)
        self.generator_card.grid(row=7, column=0, sticky="ew", padx=6, pady=8)
        ctk.CTkLabel(self.generator_card, text="Likely Base Generator Profile", font=theme.font(15, "bold"),
                     text_color=theme.ICE_WHITE).pack(anchor="w", padx=16, pady=(12, 8))
        self.generator_inner = ctk.CTkFrame(self.generator_card, fg_color="transparent")
        self.generator_inner.pack(fill="x", padx=16, pady=(0, 16))

        # ---- Verdict ----
        self.verdict_card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=2,
                                          border_color=theme.BORDER)
        self.verdict_card.grid(row=8, column=0, sticky="ew", padx=6, pady=8)
        self.verdict_badge = ctk.CTkLabel(self.verdict_card, text="AWAITING ANALYSIS", font=theme.font(16, "bold"),
                                           text_color=theme.MUTED_GRAY)
        self.verdict_badge.pack(anchor="w", padx=16, pady=(14, 4))
        self.verdict_text = ctk.CTkLabel(self.verdict_card, text="Upload an image above to generate a probabilistic forensic verdict.",
                                          font=theme.font(12), text_color=theme.MUTED_GRAY, justify="left",
                                          wraplength=880)
        self.verdict_text.pack(anchor="w", padx=16, pady=(0, 8))

        action_row = ctk.CTkFrame(self.verdict_card, fg_color="transparent")
        action_row.pack(fill="x", padx=16, pady=(0, 16))
        self.download_btn = ctk.CTkButton(action_row, text="⬇ Secure Download (Watermarked)", state="disabled",
                                           fg_color=theme.ELECTRIC_BLUE, hover_color=theme.ELECTRIC_BLUE_HOVER,
                                           command=self._download_watermarked)
        self.download_btn.pack(side="left", padx=(0, 10))
        self.report_btn = ctk.CTkButton(action_row, text="🚩 Report Incorrect Detection", state="disabled",
                                         fg_color=theme.VERDICT_WARNING, hover_color="#B8790A",
                                         text_color="#1a1200",
                                         command=self._open_feedback_dialog)
        self.report_btn.pack(side="left")

        ctk.CTkFrame(page, height=30, fg_color="transparent").grid(row=9, column=0)
        return page

    def _build_info_card_contents(self):
        ctk.CTkLabel(self.info_card, text="File Intelligence", font=theme.font(15, "bold"),
                     text_color=theme.ICE_WHITE).grid(row=0, column=0, columnspan=2, sticky="w", padx=16, pady=(12, 8))
        fields = ["Filename", "Resolution", "File Size", "Format", "SHA-256", "MD5", "EXIF Fingerprint"]
        for i, field_name in enumerate(fields, start=1):
            ctk.CTkLabel(self.info_card, text=f"{field_name}:", font=theme.font(11, "bold"),
                         text_color=theme.MUTED_GRAY).grid(row=i, column=0, sticky="nw", padx=(16, 8), pady=3)
            val_lbl = ctk.CTkLabel(self.info_card, text="—", font=theme.font(11, family=theme.FONT_MONO),
                                    text_color=theme.ICE_WHITE, anchor="w", justify="left", wraplength=760)
            val_lbl.grid(row=i, column=1, sticky="w", padx=(0, 16), pady=3)
            self.info_labels[field_name] = val_lbl
        ctk.CTkFrame(self.info_card, height=8, fg_color="transparent").grid(row=len(fields) + 1, column=0)

    # ------------------------------------------------------------- ingest
    def _browse_file(self):
        path = filedialog.askopenfilename(
            title="Select an image",
            filetypes=[("Images", "*.png *.jpg *.jpeg *.bmp *.webp *.tiff")]
        )
        if path:
            self._ingest_file(path)

    def _on_drop(self, event):
        raw = event.data
        path = raw.strip("{}")
        self._ingest_file(path)

    def _ingest_file(self, path):
        if not path.lower().endswith(VALID_EXTS):
            messagebox.showerror("Unsupported file", "Please select a valid image file.")
            return
        size_mb = os.path.getsize(path) / (1024 * 1024)
        if size_mb > MAX_FILE_MB:
            messagebox.showerror("File too large", f"File is {size_mb:.1f}MB — the 50MB limit was exceeded.")
            return

        self.current_filepath = path
        self.ingest_label.configure(text=f"✔ Loaded: {os.path.basename(path)}")
        self._reset_custody()
        self._log_custody_step("File ingested")
        threading.Thread(target=self._run_pipeline, args=(path,), daemon=True).start()

    # ------------------------------------------------------- custody log
    def _reset_custody(self):
        for widget in self.custody_list_frame.winfo_children():
            widget.destroy()
        self.custody_steps = []

    def _log_custody_step(self, label):
        step = ChainOfCustodyStep(label)
        step.timestamp = datetime.now().strftime("%H:%M:%S")
        step.done = True
        self.custody_steps.append(step)
        row = ctk.CTkFrame(self.custody_list_frame, fg_color="transparent")
        row.pack(fill="x", pady=2)
        ctk.CTkLabel(row, text="●", text_color=theme.VERDICT_AUTHENTIC, font=theme.font(14)).pack(side="left", padx=(0, 8))
        ctk.CTkLabel(row, text=f"{step.timestamp}  —  {label}", font=theme.font(11),
                     text_color=theme.ICE_WHITE).pack(side="left")
        self.update_idletasks()

    # ------------------------------------------------------------ pipeline
    def _run_pipeline(self, path):
        try:
            info = fu.get_file_info(path)
            self.current_info = info
            self.after(0, self._log_custody_step, "Cryptographic hash computed (SHA-256 / MD5)")
            self.after(0, self._update_info_card, info)

            exif = fu.extract_exif(path)
            exif_summary = fu.format_exif_summary(exif)
            self.after(0, self._log_custody_step, "EXIF metadata profile extracted")

            ela_img, mean_err = fu.generate_ela_image(path)
            self.current_ela_mean = mean_err
            self.after(0, self._log_custody_step, "Error Level Analysis computed")

            edge_img = fu.generate_edge_map(path)
            self.after(0, self._log_custody_step, "Geometric edge continuity map generated")

            freq_arr = fu.generate_frequency_spectrum(path)
            self.after(0, self._log_custody_step, "FFT frequency spectrum generated")

            self.after(0, self._display_canvases, path, edge_img, freq_arr, ela_img)

            time.sleep(0.15)
            result = de.run_fusion_engine(info["sha256"], exif_summary, mean_err)
            self.current_result = result
            self.after(0, self._log_custody_step, "Multi-model evidence aggregation complete")
            self.after(0, self._display_layers, result)
            self.after(0, self._display_generators, result)
            self.after(0, self._display_verdict, result)
            self.after(0, self._log_custody_step, "Verdict finalized & watermark staged")
            self.after(0, lambda: self.download_btn.configure(state="normal"))
            self.after(0, lambda: self.report_btn.configure(state="normal"))
        except Exception as e:
            self.after(0, lambda: messagebox.showerror("Analysis error", str(e)))

    def _update_info_card(self, info):
        self.info_labels["Filename"].configure(text=info["filename"])
        self.info_labels["Resolution"].configure(text=info["resolution"])
        self.info_labels["File Size"].configure(text=info["filesize_readable"])
        self.info_labels["Format"].configure(text=str(info["format"]))
        self.info_labels["SHA-256"].configure(text=info["sha256"])
        self.info_labels["MD5"].configure(text=info["md5"])
        exif_summary = fu.format_exif_summary(fu.extract_exif(self.current_filepath))
        fingerprint = exif_summary.get("EditingToolFingerprint", "None detected")
        self.info_labels["EXIF Fingerprint"].configure(text=fingerprint)

    def _pil_to_ctk(self, pil_img, max_w=760):
        w, h = pil_img.size
        if w > max_w:
            ratio = max_w / w
            pil_img = pil_img.resize((max_w, int(h * ratio)))
        return ctk.CTkImage(light_image=pil_img, dark_image=pil_img, size=pil_img.size)

    def _display_canvases(self, path, edge_img, freq_arr, ela_img):
        original = Image.open(path).convert("RGB")
        ctk_orig = self._pil_to_ctk(original)
        self.tk_image_refs["original"] = ctk_orig
        self.canvas_image_labels["Original"].configure(image=ctk_orig, text="")

        ctk_edge = self._pil_to_ctk(edge_img)
        self.tk_image_refs["edge"] = ctk_edge
        self.canvas_image_labels["Edge / Geometry"].configure(image=ctk_edge, text="")

        freq_img = Image.fromarray(freq_arr).convert("L")
        ctk_freq = self._pil_to_ctk(freq_img)
        self.tk_image_refs["freq"] = ctk_freq
        self.canvas_image_labels["Frequency Spectrum"].configure(image=ctk_freq, text="")

        ctk_ela = self._pil_to_ctk(ela_img)
        self.tk_image_refs["ela"] = ctk_ela
        self.canvas_image_labels["ELA Heatmap"].configure(image=ctk_ela, text="")

    def _display_layers(self, result):
        for w in self.layers_inner.winfo_children():
            w.destroy()
        for layer in result.layers:
            row = ctk.CTkFrame(self.layers_inner, fg_color=theme.SLATE_BLUE, corner_radius=10)
            row.pack(fill="x", pady=4)
            top = ctk.CTkFrame(row, fg_color="transparent")
            top.pack(fill="x", padx=12, pady=(8, 2))
            ctk.CTkLabel(top, text=layer.layer_name, font=theme.font(12, "bold"),
                         text_color=theme.ICE_WHITE).pack(side="left")
            ctk.CTkLabel(top, text=f"{layer.ai_probability:.1f}% AI-probability   ·   {layer.confidence:.1f}% confidence",
                         font=theme.font(11), text_color=theme.MUTED_GRAY).pack(side="right")
            bar = ctk.CTkProgressBar(row, height=8, progress_color=self._bar_color(layer.ai_probability))
            bar.pack(fill="x", padx=12, pady=(2, 6))
            bar.set(layer.ai_probability / 100)
            for diag in layer.diagnostics:
                ctk.CTkLabel(row, text=f"· {diag}", font=theme.font(10), text_color=theme.MUTED_GRAY,
                             anchor="w", justify="left", wraplength=820).pack(fill="x", padx=20, pady=1)
            ctk.CTkFrame(row, height=6, fg_color="transparent").pack()

    def _bar_color(self, prob):
        fg, _, _ = theme.status_color(prob)
        return fg

    def _display_generators(self, result):
        for w in self.generator_inner.winfo_children():
            w.destroy()
        for g in result.generator_guesses:
            row = ctk.CTkFrame(self.generator_inner, fg_color="transparent")
            row.pack(fill="x", pady=4)
            ctk.CTkLabel(row, text=g.name, font=theme.font(12), text_color=theme.ICE_WHITE,
                         width=200, anchor="w").pack(side="left")
            bar = ctk.CTkProgressBar(row, height=10, progress_color=theme.ELECTRIC_BLUE)
            bar.pack(side="left", fill="x", expand=True, padx=10)
            bar.set(g.probability / 100)
            ctk.CTkLabel(row, text=f"{g.probability:.1f}%", font=theme.font(11, "bold"),
                         text_color=theme.ICE_WHITE, width=50).pack(side="left")

    def _display_verdict(self, result):
        fg, bg, label = theme.status_color(result.overall_ai_probability)
        self.verdict_card.configure(border_color=fg)
        self.verdict_badge.configure(
            text=f"{label}   —   {result.overall_ai_probability:.1f}% AI-probability   ·   {result.overall_confidence:.1f}% system confidence",
            text_color=fg)
        self.verdict_text.configure(text=result.verdict_paragraph, text_color=theme.ICE_WHITE)

    # ------------------------------------------------------------- actions
    def _download_watermarked(self):
        if not self.current_filepath or not self.current_result:
            return
        is_ai = self.current_result.overall_ai_probability >= 50
        default_name = f"FindingAI_{'AI' if is_ai else 'Authentic'}_{self.current_info['filename']}"
        save_path = filedialog.asksaveasfilename(
            title="Save watermarked image", initialfile=default_name,
            defaultextension=".jpg", filetypes=[("JPEG Image", "*.jpg"), ("PNG Image", "*.png")]
        )
        if not save_path:
            return
        try:
            fu.apply_watermark(self.current_filepath, is_ai, save_path)
            messagebox.showinfo("Saved", f"Watermarked image saved to:\n{save_path}")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def _open_feedback_dialog(self):
        if not self.current_result:
            return
        dialog = ctk.CTkToplevel(self)
        dialog.title("Report Incorrect Detection")
        dialog.geometry("460x420")
        dialog.configure(fg_color=theme.SLATE_BLUE)
        dialog.grab_set()

        ctk.CTkLabel(dialog, text="Feedback Ledger Entry", font=theme.font(16, "bold"),
                     text_color=theme.ICE_WHITE).pack(anchor="w", padx=20, pady=(18, 4))
        ctk.CTkLabel(dialog, text=f"File: {self.current_info['filename']}\nSystem verdict: {self.current_result.verdict_label} "
                                   f"({self.current_result.overall_ai_probability:.1f}%)",
                     font=theme.font(11), text_color=theme.MUTED_GRAY, justify="left").pack(anchor="w", padx=20, pady=(0, 12))

        ctk.CTkLabel(dialog, text="Correct label (your assessment):", font=theme.font(12),
                     text_color=theme.ICE_WHITE).pack(anchor="w", padx=20)
        label_var = ctk.StringVar(value="Real")
        label_menu = ctk.CTkOptionMenu(dialog, values=["Real", "AI-Generated", "Uncertain / Mixed"],
                                        variable=label_var, fg_color=theme.SURFACE,
                                        button_color=theme.ELECTRIC_BLUE, button_hover_color=theme.ELECTRIC_BLUE_HOVER)
        label_menu.pack(anchor="w", padx=20, pady=(4, 14), fill="x")

        ctk.CTkLabel(dialog, text="Notes for the review team:", font=theme.font(12),
                     text_color=theme.ICE_WHITE).pack(anchor="w", padx=20)
        notes_box = ctk.CTkTextbox(dialog, height=120, fg_color=theme.SURFACE, text_color=theme.ICE_WHITE)
        notes_box.pack(fill="x", padx=20, pady=(4, 14))

        def submit():
            record = {
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "filename": self.current_info["filename"],
                "sha256": self.current_info["sha256"],
                "predicted_label": self.current_result.verdict_label,
                "predicted_ai_probability": self.current_result.overall_ai_probability,
                "corrected_label": label_var.get(),
                "user_notes": notes_box.get("1.0", "end").strip(),
                "system_confidence": self.current_result.overall_confidence,
                "layer_snapshot": "; ".join(f"{l.layer_name}={l.ai_probability}%" for l in self.current_result.layers),
            }
            fm.append_feedback(record)
            messagebox.showinfo("Logged", "Feedback recorded to feedback_log.csv.")
            dialog.destroy()

        btn_row = ctk.CTkFrame(dialog, fg_color="transparent")
        btn_row.pack(fill="x", padx=20, pady=(0, 18))
        ctk.CTkButton(btn_row, text="Submit Correction", fg_color=theme.ELECTRIC_BLUE,
                      hover_color=theme.ELECTRIC_BLUE_HOVER, command=submit).pack(side="left")
        ctk.CTkButton(btn_row, text="Cancel", fg_color=theme.SURFACE, hover_color=theme.SLATE_BLUE_LIGHT,
                      command=dialog.destroy).pack(side="left", padx=8)

    # ---------------------------------------------------------- monitoring
    def _build_monitoring_page(self):
        page = ctk.CTkScrollableFrame(self.content_container, fg_color=theme.DEEP_BLACK)
        page.grid_columnconfigure((0, 1, 2), weight=1)

        ctk.CTkLabel(page, text="Model Monitoring & Analytical Auditing", font=theme.font(24, "bold"),
                     text_color=theme.ICE_WHITE).grid(row=0, column=0, columnspan=3, sticky="w", padx=6, pady=(10, 16))

        self.metric_cards = {}
        metrics_meta = [("accuracy", "Accuracy", "%"), ("f1_score", "F1 Score", ""), ("dataset_scale", "Dataset Scale", " imgs")]
        for i, (key, label, suffix) in enumerate(metrics_meta):
            card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=1, border_color=theme.BORDER)
            card.grid(row=1, column=i, sticky="ew", padx=6, pady=6)
            ctk.CTkLabel(card, text=label, font=theme.font(12), text_color=theme.MUTED_GRAY).pack(anchor="w", padx=16, pady=(14, 2))
            val_lbl = ctk.CTkLabel(card, text="—", font=theme.font(26, "bold"), text_color=theme.ELECTRIC_BLUE)
            val_lbl.pack(anchor="w", padx=16, pady=(0, 14))
            self.metric_cards[key] = (val_lbl, suffix)

        chart_card = ctk.CTkFrame(page, fg_color=theme.SURFACE, corner_radius=14, border_width=1, border_color=theme.BORDER)
        chart_card.grid(row=2, column=0, columnspan=3, sticky="ew", padx=6, pady=10)
        ctk.CTkLabel(chart_card, text="Accuracy Trend (mock, reacts to feedback ledger volume)",
                     font=theme.font(13, "bold"), text_color=theme.ICE_WHITE).pack(anchor="w", padx=16, pady=(12, 4))
        self.monitoring_chart_frame = ctk.CTkFrame(chart_card, fg_color="transparent")
        self.monitoring_chart_frame.pack(fill="x", padx=16, pady=(0, 16))

        refresh_btn = ctk.CTkButton(page, text="↻ Refresh Metrics", fg_color=theme.ELECTRIC_BLUE,
                                     hover_color=theme.ELECTRIC_BLUE_HOVER, command=self._refresh_monitoring)
        refresh_btn.grid(row=3, column=0, sticky="w", padx=6, pady=6)

        note = ctk.CTkLabel(page, text=("Note: these metrics are illustrative mock analytics derived from the local "
                                         "feedback_log.csv row count — no real model retraining occurs in this build."),
                             font=theme.font(10), text_color=theme.MUTED_GRAY, wraplength=900, justify="left")
        note.grid(row=4, column=0, columnspan=3, sticky="w", padx=6, pady=(4, 20))
        return page

    def _refresh_monitoring(self):
        metrics = fm.compute_mock_monitoring_metrics()
        self.metric_cards["accuracy"][0].configure(text=f"{metrics['accuracy']}{self.metric_cards['accuracy'][1]}")
        self.metric_cards["f1_score"][0].configure(text=f"{metrics['f1_score']}{self.metric_cards['f1_score'][1]}")
        self.metric_cards["dataset_scale"][0].configure(text=f"{metrics['dataset_scale']:,}{self.metric_cards['dataset_scale'][1]}")

        for w in self.monitoring_chart_frame.winfo_children():
            w.destroy()

        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

            fig, ax = plt.subplots(figsize=(8.6, 2.6), dpi=100)
            fig.patch.set_facecolor(theme.SURFACE)
            ax.set_facecolor(theme.SURFACE)
            history = metrics["accuracy_history"]
            ax.plot(range(len(history)), history, color=theme.ELECTRIC_BLUE, linewidth=2, marker="o", markersize=3)
            ax.fill_between(range(len(history)), history, min(history) - 0.2, color=theme.ELECTRIC_BLUE, alpha=0.15)
            ax.tick_params(colors=theme.MUTED_GRAY, labelsize=8)
            for spine in ax.spines.values():
                spine.set_color(theme.BORDER)
            ax.set_ylabel("Accuracy %", color=theme.MUTED_GRAY, fontsize=9)
            fig.tight_layout()

            canvas = FigureCanvasTkAgg(fig, master=self.monitoring_chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="x")
        except Exception as e:
            ctk.CTkLabel(self.monitoring_chart_frame, text=f"(chart unavailable: {e})",
                         text_color=theme.MUTED_GRAY).pack()

    # -------------------------------------------------------------- ledger
    def _build_ledger_page(self):
        page = ctk.CTkFrame(self.content_container, fg_color=theme.DEEP_BLACK)
        page.grid_columnconfigure(0, weight=1)
        page.grid_rowconfigure(2, weight=1)

        ctk.CTkLabel(page, text="Feedback Ledger — Active CSV Matrix", font=theme.font(24, "bold"),
                     text_color=theme.ICE_WHITE).grid(row=0, column=0, sticky="w", padx=16, pady=(16, 4))
        ctk.CTkLabel(page, text=f"Backed by: {fm.DEFAULT_CSV_PATH}", font=theme.font(10),
                     text_color=theme.MUTED_GRAY).grid(row=1, column=0, sticky="w", padx=16, pady=(0, 10))

        self.ledger_scroll = ctk.CTkScrollableFrame(page, fg_color=theme.SURFACE, corner_radius=12)
        self.ledger_scroll.grid(row=2, column=0, sticky="nswe", padx=16, pady=(0, 16))
        self.ledger_scroll.grid_columnconfigure((0, 1, 2, 3, 4), weight=1)
        return page

    def _refresh_ledger(self):
        for w in self.ledger_scroll.winfo_children():
            w.destroy()
        rows = fm.read_all_feedback()
        headers = ["Timestamp", "Filename", "Predicted", "Corrected", "Notes"]
        for c, h in enumerate(headers):
            ctk.CTkLabel(self.ledger_scroll, text=h, font=theme.font(11, "bold"),
                         text_color=theme.ELECTRIC_BLUE).grid(row=0, column=c, sticky="w", padx=8, pady=6)
        if not rows:
            ctk.CTkLabel(self.ledger_scroll, text="No corrections logged yet.", font=theme.font(11),
                         text_color=theme.MUTED_GRAY).grid(row=1, column=0, columnspan=5, sticky="w", padx=8, pady=10)
            return
        for r, row in enumerate(reversed(rows), start=1):
            vals = [row.get("timestamp", ""), row.get("filename", ""), row.get("predicted_label", ""),
                    row.get("corrected_label", ""), row.get("user_notes", "")[:60]]
            for c, v in enumerate(vals):
                ctk.CTkLabel(self.ledger_scroll, text=str(v), font=theme.font(10),
                             text_color=theme.ICE_WHITE, anchor="w", wraplength=220).grid(
                    row=r, column=c, sticky="w", padx=8, pady=4)

    # --------------------------------------------------------------- about
    def _build_about_page(self):
        page = ctk.CTkScrollableFrame(self.content_container, fg_color=theme.DEEP_BLACK)
        page.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(page, text="About & Methodology", font=theme.font(24, "bold"),
                     text_color=theme.ICE_WHITE).grid(row=0, column=0, sticky="w", padx=6, pady=(10, 16))

        body = (
            "Finding AI is a local, offline forensic workspace for reviewing image authenticity signals.\n\n"
            "REAL analysis performed on-device:\n"
            "  • SHA-256 / MD5 cryptographic hashing\n"
            "  • EXIF metadata extraction (camera make/model, exposure, software tags)\n"
            "  • Error Level Analysis via JPEG re-compression differencing\n"
            "  • Edge / geometric continuity mapping\n"
            "  • 2D FFT frequency magnitude spectrum\n\n"
            "SIMULATED analysis (for architecture demonstration — not a validated model):\n"
            "  • Sensor noise / PRNU consistency scoring\n"
            "  • Deep-zoom anatomical anomaly scoring (hands, eyes, teeth, hair)\n"
            "  • Base-generator profiling (Midjourney / DALL·E / Stable Diffusion / Firefly)\n"
            "  • Overall fused AI-probability verdict\n\n"
            "This distinction matters: production-grade deepfake detection requires a trained "
            "classifier evaluated against labeled datasets. This build focuses on a complete, "
            "wired-up desktop application architecture — ingest, multi-layer analysis UI, chain-of-"
            "custody logging, watermarking, and a feedback/monitoring loop — ready for a real model "
            "to be dropped into detection_engine.py."
        )
        ctk.CTkLabel(page, text=body, font=theme.font(12), text_color=theme.ICE_WHITE,
                     justify="left", wraplength=900).grid(row=1, column=0, sticky="w", padx=6)
        return page
