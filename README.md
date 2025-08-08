# Fine-Tuning Small Language Models (SLMs) for Autonomous Web GIS (AWebGIS)

This repository contains all materials related to our paper:  
**_"Fine-Tuning Small Language Models (SLMs) for Autonomous Web GIS (AWebGIS)"_**

---

## 📁 Contents

- 📓 `models/notebooks/` — Jupyter notebooks for training and evaluation
- 🤖 `models/output/` — Trained model files
- ⚛️ `app/` — React-based frontend application
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

If you want to see the output on the browser you can use the bellow ReacJS app developed by TypeScript.

```bash
cd app
npm i
npm run dev
```

---

## 🔍 Model Access

The fine-tuned T5-small model is available on Hugging Face:
👉 [https://huggingface.co/mahdin75/awebgis](https://huggingface.co/mahdin75/awebgis)

---

## 📖 Citation

If you use this work, please cite:

```bibtex
@misc{ashani2025finetuningsmalllanguagemodels,
      title={Fine-Tuning Small Language Models (SLMs) for Autonomous Web-based Geographical Information Systems (AWebGIS)}, 
      author={Mahdi Nazari Ashani and Ali Asghar Alesheikh and Saba Kazemi and Kimya Kheirkhah and Yasin Mohammadi and Fatemeh Rezaie and Amir Mahdi Manafi and Hedieh Zarkesh},
      year={2025},
      eprint={2508.04846},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2508.04846}, 
}
```

---

## 📄 Publication

The published paper is available at:
👉 _\[https://arxiv.org/abs/2508.04846](https://arxiv.org/abs/2508.04846)]_

---
