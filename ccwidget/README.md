ccwidget
===============================

ization of counterfactuals

Installation
------------

To install use pip:

    $ pip install ccwidget

For a development installation (requires [Node.js](https://nodejs.org) and [Yarn version 1](https://classic.yarnpkg.com/)),

    $ git clone https://github.com/FGV Visual Data Science Lab/ccwidget.git
    $ cd ccwidget
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --overwrite --sys-prefix ccwidget
    $ jupyter nbextension enable --py --sys-prefix ccwidget

When actively developing your extension for JupyterLab, run the command:

    $ jupyter labextension develop --overwrite ccwidget

Then you need to rebuild the JS when you make a code change:

    $ cd js
    $ yarn run build

You then need to refresh the JupyterLab page when your javascript changes.
