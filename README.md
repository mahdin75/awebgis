# Fine-Tuning Small Language Models (SLMs) for Autonomous Web-based Geographical Information Systems (AWebGIS)

This repository contains all materials related to our preprint:

**_"Fine-Tuning Small Language Models (SLMs) for Autonomous Web-based Geographical Information Systems (AWebGIS)"_**

---

## 📁 Contents

- 📓 `models/notebooks/` — Jupyter notebooks for training and evaluation
- ⚛️ `app/` — React-based frontend application (submodule from [awebgis-app](https://github.com/mahdin75/awebgis-app))
- 📊 `data/` — Dataset descriptions and sample inputs

---

## 🚀 Quick Start

### 1. Training and Evaluation

The t5-small notebook has been executed on Google Colab, while the remaining scripts have been tested both locally and on Colab.

You can follow the instructions below to re-run the scripts.

```bash
# Set up the Python environment
cd models
pip install -r requirements.txt

# Launch the Jupyter notebooks
python -m notebook
```

### 2. Launch the React Frontend

The React frontend application is maintained in a separate repository. If you want to see the output on the browser, you can use the ReactJS app developed by TypeScript.

**Note:** The `app/` directory is a git submodule pointing to [https://github.com/mahdin75/awebgis-app](https://github.com/mahdin75/awebgis-app). If you clone this repository, make sure to initialize and update the submodule:

```bash
# Clone with submodules
git clone --recurse-submodules <repository-url>

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Then navigate to the app directory
cd app
npm i
npm run dev
```

---

## 🔍 Model Access

The fine-tuned models are available on Hugging Face:

- 👉 [mahdin75/awebgis-tiny](https://huggingface.co/mahdin75/awebgis-tiny)
- 👉 [mahdin75/awebgis-mini](https://huggingface.co/mahdin75/awebgis-mini)
- 👉 [mahdin75/awebgis-small](https://huggingface.co/mahdin75/awebgis-small)

---


### 📌 Recommended BibTeX (Published Version)

```bibtex
@article{NazariAshani2026AWebGIS,
  author = {Mahdi Nazari Ashani and Ali Asghar Alesheikh and Saba Kazemi and Kimya Kheirkhah and Yasin Mohammadi and Fatemeh Rezaie and Amir Mahdi Manafi and Hedieh Zahra Zarkesh},
  title = {Fine-tuning Small Language Models (SLMs) for autonomous web-based geographical information systems (AWebGIS)},
  journal = {Cartography and Geographic Information Science},
  volume = {0},
  number = {0},
  pages = {1--16},
  year = {2026},
  publisher = {Taylor \& Francis},
  doi = {10.1080/15230406.2026.2625987},
  url = {https://doi.org/10.1080/15230406.2026.2625987}
}
```

---

## 📄 Publication Status

This work has now been **peer-reviewed and published** in *Cartography and Geographic Information Science*.

👉 Published version: [https://doi.org/10.1080/15230406.2026.2625987](https://doi.org/10.1080/15230406.2026.2625987)

---