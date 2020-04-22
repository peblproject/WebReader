define([
'./ModuleConfig',
'jquery',
'bootstrap',
'bootstrapA11y',
'StorageManager',
'Settings',
'./EpubLibraryManager',
'i18nStrings',
'hgn!readium_js_viewer_html_templates/library-navbar.html',
'hgn!readium_js_viewer_html_templates/library-body.html',
'hgn!readium_js_viewer_html_templates/empty-library.html',
'hgn!readium_js_viewer_html_templates/library-item.html',
'hgn!readium_js_viewer_html_templates/details-dialog.html',
'hgn!readium_js_viewer_html_templates/about-dialog.html',
'hgn!readium_js_viewer_html_templates/details-body.html',
'hgn!readium_js_viewer_html_templates/add-epub-dialog.html',
'hgn!readium_js_viewer_html_templates/download-books-dialog.html',
'hgn!readium_js_viewer_html_templates/install-reader-dialog.html',
'hgn!readium_js_viewer_html_templates/install-ios-reader-dialog.html',
'hgn!readium_js_viewer_html_templates/spinner-dialog.html',
'./Spinner',
'./ReaderSettingsDialog',
'./Dialogs',
'./workers/Messages',
'Analytics',
'./Keyboard',
'./versioning/ReadiumVersioning',
'readium_shared_js/helpers'],

function(
moduleConfig,
$,
bootstrap,
bootstrapA11y,
StorageManager,
Settings,
libraryManager,
Strings,
LibraryNavbar,
LibraryBody,
EmptyLibrary,
LibraryItem,
DetailsDialog,
AboutDialog,
DetailsBody,
AddEpubDialog,
DownloadBooksDialog,
InstallReaderDialog,
InstallIosReaderDialog,
SpinnerDialog,
spinner,
SettingsDialog,
Dialogs,
Messages,
Analytics,
Keyboard,
Versioning,
Helpers){

    var detailsDialogStr = DetailsDialog({strings: Strings});

    var heightRule,
        noCoverRule;
        //maxHeightRule

    var spinLibrary = function(on) {
        if (on) {
            //console.error("do SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
            if (spinner.willSpin || spinner.isSpinning) return;

            spinner.willSpin = true;

            setTimeout(function() {
                if (spinner.stopRequested) {
                    //console.debug("STOP REQUEST: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                    spinner.willSpin = false;
                    spinner.stopRequested = false;
                    return;
                }
                //console.debug("SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.isSpinning = true;
                spinner.spin($('#install-spinner-body')[0]);

                spinner.willSpin = false;

            }, 100);
        } else {

            if (spinner.isSpinning) {
                //console.debug("!! SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stop();
                spinner.isSpinning = false;
            } else if (spinner.willSpin) {
                //console.debug("!! SPIN REQ: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stopRequested = true;
            }
        }
    };

    var findHeightRule = function(){

         var styleSheet=document.styleSheets[0];
         var ii=0;
         var cssRule;
        do {
            if (styleSheet.cssRules) {
                cssRule = styleSheet.cssRules[ii];
            } else {
                cssRule = styleSheet.rules[ii];
            }
            if (cssRule && cssRule.selectorText)  {
                if (cssRule.selectorText.toLowerCase()=='.library-item') {
                    heightRule = cssRule;
                }
                // else if (cssRule.selectorText.toLowerCase()=='.library-item img') {
                //     maxHeightRule = cssRule;
                // }
                else if (cssRule.selectorText.toLowerCase() == 'body:not(.list-view) .library-item .no-cover'){
                    noCoverRule = cssRule;
                }

            }
            ii++;
        } while (cssRule);
       }


    var setItemHeight = function(){
        if (!heightRule || !noCoverRule) return;

        var medWidth = 2,
            smWidth = 3,
            xsWidth = 4,
            rowHeight = 0,
            imgWidth = 0,
            scale = 1;

        var winWidth = window.innerWidth;

        if (winWidth >= 992){
            imgWidth = winWidth * (medWidth/12) - 30;
            rowHeight = 1.33 * imgWidth + 60;
        }
        else if (winWidth >= 768){
            imgWidth = winWidth * (smWidth/12) - 30;
            rowHeight = 1.33 * imgWidth + 60;
        }
        else{
            imgWidth = winWidth * (xsWidth/12) - 30;
            rowHeight = 1.33 * imgWidth + 20;
        }
        heightRule.style.height  = rowHeight + 'px';
        scale = imgWidth/300;

        noCoverRule.style.width = imgWidth + 'px';
        noCoverRule.style.height = 1.33 * imgWidth + 'px';
        noCoverRule.style.fontSize = 40 * scale + 'px';
        //maxHeightRule.style.height = 1.33 * imgWidth + 'px';
        //maxHeightRule.style.width = imgWidth + 'px';
    };

    var showDetailsDialog = function(details){
        var bodyStr = DetailsBody({
            data: details,
            strings: Strings
        });

        $('.details-dialog .modal-body').html(bodyStr);

        $('.details-dialog .delete').on('click', function(){
            $('.details-dialog').modal('hide');
            var success = function(){
                libraryManager.retrieveAvailableEpubs(loadLibraryItems);
                Dialogs.closeModal();
            }

            var promptMsg = Strings.i18n_are_you_sure + ' \'' + details.title + '\'';

            Dialogs.showModalPrompt(Strings.delete_dlg_title, promptMsg,
                                    Strings.i18n_delete, Strings.i18n_cancel,
                                    function(){
                                        Dialogs.showModalProgress(Strings.delete_progress_title, '');
                                        Dialogs.updateProgress(100, Messages.PROGRESS_DELETING, details.title, true);
                                        libraryManager.deleteEpubWithId(details.rootDir, success, showError)
                                    });
        });
    }

    var showError = function(errorCode, data){
        Dialogs.showError(errorCode, data);
    }

    var loadDetails = function(e){
        var $this = $(this),
            url = $this.attr('data-package'),
            bookRoot = $this.attr('data-root'),
            rootDir = $this.attr('data-root-dir'),
            noCoverBg = $this.attr('data-no-cover');

        $('.details-dialog').remove();

        $('.details-dialog').off('hidden.bs.modal');
        $('.details-dialog').off('shown.bs.modal');

        $('#app-container').append(detailsDialogStr);

        $('#details-dialog').on('hidden.bs.modal', function () {
            Keyboard.scope('library');

            setTimeout(function(){ $this.focus(); }, 50);
        });
        $('#details-dialog').on('shown.bs.modal', function(){
            Keyboard.scope('details');
            setTimeout(function(){ $('#closeEpubDetailsCross')[0].focus(); }, 1000);
        });


        $('.details-dialog').modal();

        var retrieveDetails = function(packageUrl) {

            if (!packageUrl || packageUrl.indexOf(".opf") < 0) {
                console.warn("no package path (OPF within zipped EPUB archive?): " + packageUrl);
            }

            libraryManager.retrieveFullEpubDetails(packageUrl, bookRoot, rootDir, noCoverBg, showDetailsDialog, showError);
        };

        console.log("OPF package URL: " + url);
        if (url && url.indexOf(".opf") < 0) {

            var urlContainerXml = url + "META-INF/container.xml";
            $.get(urlContainerXml, function(data){

                if(typeof(data) === "string" ) {
                    var parser = new window.DOMParser;
                    data = parser.parseFromString(data, 'text/xml');
                }
                var $rootfile = $('rootfile', data);
                var rootFilePath = $rootfile.attr('full-path');
                console.log("OPF package path (root-file from container.xml): " + rootFilePath);

                var packageUrl = url + (Helpers.EndsWith(url, "/") ? "" : "/") + rootFilePath;

                console.log("OPF package URL (from container.xml): " + packageUrl);
                retrieveDetails(packageUrl);

            }).fail(function() {
                //console.warn(arguments);
                console.error("FAILED OPF package URL (from container.xml): " + urlContainerXml);
                retrieveDetails(url);
            });
        }
        else {
            retrieveDetails(url);
        }
    }

    var loadLibraryItems = function(epubs){
        var currentScrollPos = $('#app-container').scrollTop();
        $('#app-container .library-row-title').remove();
        $('#app-container .library-items.cloud-library').remove();
        $('#app-container .library-items.local-library').remove();
        $('#app-container').append(LibraryBody({strings: Strings}));

        if (!epubs.length){
            $('#app-container .library-items.cloud-library').append(EmptyLibrary({imagePathPrefix: moduleConfig.imagePathPrefix, strings: Strings}));
            return;
        }

        var processEpub = function(epubs, count) {
            var epub = epubs[count];
            if (!epub) { // count >= epubs.length
                $('.details').on('click', loadDetails);
                $('#app-container').scrollTop(currentScrollPos);
                return;
            }

            var noCoverBackground = moduleConfig.imagePathPrefix + 'images/covers/cover' + ((count % 8) + 1) + '.jpg';
            if (epub.isSubLibraryLink) {
                noCoverBackground = moduleConfig.imagePathPrefix + 'images/covers/cover2.jpg';
            }

            var createLibraryItem = function() {

                // See --COMMENT-- below!
                // if (!epub.isSubLibraryLink && !epub.packagePath) {
                //     console.warn("no epub.packagePath (OPF within zipped EPUB archive?): " + epub.rootUrl);
                //     //console.log(epub);
                // }



                var background = epub.coverHref;

                if (background) {
                    StorageManager.getFile(background, function(data) {
                        if (data)
                            var elem = LibraryItem({count:{n: count+1, tabindex:count*2+99}, epub: epub, coverHref: URL.createObjectURL(data), strings: Strings, noCoverBackground: noCoverBackground});
                        else
                            var elem = LibraryItem({count:{n: count+1, tabindex:count*2+99}, epub: epub, coverHref: background, strings: Strings, noCoverBackground: noCoverBackground});
                        if (epub.rootUrl.substr(0, 5) == "db://")
                            $('.library-items.local-library').append(elem);
                        else
                            $('.library-items.cloud-library').append(elem);

                        processEpub(epubs, ++count);
                    }, function() {
                        var elem = LibraryItem({count:{n: count+1, tabindex:count*2+99}, epub: epub, strings: Strings, noCoverBackground: noCoverBackground});
                        if (epub.rootUrl.substr(0, 5) == "db://")
                            $('.library-items.local-library').append(elem);
                        else
                            $('.library-items.cloud-library').append(elem);

                        processEpub(epubs, ++count);
                    });
                } else {
                    var elem = LibraryItem({count:{n: count+1, tabindex:count*2+99}, epub: epub, coverHref: background, strings: Strings, noCoverBackground: noCoverBackground});
                    if (epub.rootUrl.substr(0, 5) == "db://")
                            $('.library-items.local-library').append(elem);
                        else
                            $('.library-items.cloud-library').append(elem);
                    processEpub(epubs, ++count);
                }





            };

            if (!epub.isSubLibraryLink && !epub.packagePath) {

                createLibraryItem();

                // --COMMENT--
                // Code below works, but just here to demonstrate how the package OPF path can be resolved whilst populating the library view. Because the HTTP requests for each ebook introduce huge lag, instead we resolve the OPF path on-demand, when user chooses to see the EPUB details / metadata dialog popup (see loadDetails() function above, which itself emits an HTTP request to get the actual OPF file XML payload, via LibraryManager.retrieveFullEpubDetails())
                // $.get(epub.rootUrl + "/META-INF/container.xml", function(data){

                //     if(typeof(data) === "string" ) {
                //         var parser = new window.DOMParser;
                //         data = parser.parseFromString(data, 'text/xml');
                //     }
                //     var $rootfile = $('rootfile', data);
                //     epub.packagePath = $rootfile.attr('full-path');

                //     createLibraryItem();

                // }).fail(function() {
                //     //console.warn(arguments);
                //     createLibraryItem();
                // });
            }
            else {
                createLibraryItem();
            }
        };
        processEpub(epubs, 0);

        var initializeLibrarySearch = function() {
            window.AllSpineDocuments = [];

            libraryManager.retrieveAvailableEpubs(function(epubs) {
                console.log(epubs);

                var getStuff = function(index, arr) {
                    var epub = arr[index];
                    window.READIUM.getPackageDocument(epub.rootUrl, function(packageDocument) {
                        var packageData = packageDocument.getSharedJsPackageData();
                        var spine = packageData.spine;
                        window.AllSpineDocuments[index] = {
                            title: epub.title,
                            rootUrl: epub.rootUrl,
                            spineDocuments: []
                        }

                        for (var j = 0; j < spine.items.length; j++) {
                            var spineItem = spine.items[j];
                            (function(epub, index, spineItem, j, packageData) {
                                var fetcher = window.READIUM.getCurrentPublicationFetcher();
                                fetcher.fetchContentDocumentWithoutResolvingDom({spineItem: spineItem}, packageData.rootUrl + '/' + spineItem.href, function(resolvedContentDocumentDom) {
                                    var searchDocumentObject = {
                                        spineItem: spineItem,
                                        htmlDocument: resolvedContentDocumentDom
                                    }
                                    window.AllSpineDocuments[index].spineDocuments[j] = searchDocumentObject;
                                }, function(err) {
                                    console.log(err);
                                });
                            })(epub, index, spineItem, j, packageData);
                        }
                        console.log(packageData);

                        if (index < arr.length - 1) {
                            index++;
                            getStuff(index, arr);
                        }
                    });
                }

                getStuff(0, epubs);
            });
        }

        var searchShowHideToggle = function() {
            var searchBody = $('#search-library-body');
            var hide = searchBody.hasClass('search-library-visible');
            if (hide) {
                searchBody.removeClass('search-library-visible');

                $('#searchNotInitialized').remove();

                PeBL.emitEvent(PeBL.events.eventUndisplayed, {
                    target: 'PeBL Library Search',
                    type: 'Search'
                });
            } else {
                if (!window.READIUM)
                    return window.alert('Bookshelf search has not been initialized. Please open any book from the bookshelf to initialize the search.');
                searchBody.addClass('search-library-visible');

                initializeLibrarySearch();

                PeBL.emitEvent(PeBL.events.eventDisplayed, {
                    target: 'PeBL Library Search',
                    type: 'Search'
                });
            }
        }

        $('#search-library-body').prepend('<div id="search-body-list"></div>');

        $('#search-library-body').prepend('<div><input id="searchInput" placeholder="Search this book" /></div>');

        $('#search-library-body').prepend('<h2 aria-label="' + Strings.search + '" title="' + Strings.search + '"><img src="images/pebl-icons-search.svg" aria-hidden="true" height="18px"> ' + Strings.search + '</h2>');
        $('#search-library-body').prepend('<button tabindex="50" type="button" class="close" data-dismiss="modal" aria-label="' + Strings.i18n_close + ' ' + Strings.search + '" title="' + Strings.i18n_close + ' ' + Strings.search + '"><span aria-hidden="true">&times;</span></button>');

        $('#search-library-body button.close').on('click', function() {
            searchShowHideToggle();
            return false;
        });



        $('#searchButt').on('click', searchShowHideToggle);

        $('#searchInput').on('input', _.debounce(function() {
            $('#search-body-list').children().remove();
            var text = this.value;
            var searchResults = [];
            if (text.trim().length > 0) {
                var regex = new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "gi"); // Escape the input
                for (var i = 0; i < window.AllSpineDocuments.length; i++) {
                    searchResults[i] = {
                        title: window.AllSpineDocuments[i].title,
                        rootUrl: window.AllSpineDocuments[i].rootUrl,
                        spineDocuments: []
                    };
                    for (var j = 0; j < window.AllSpineDocuments[i].spineDocuments.length; j++) {
                        var documentObject = window.AllSpineDocuments[i].spineDocuments[j];
                        var spineDocument = documentObject.htmlDocument;
                        searchResults[i].spineDocuments[j] = {title: spineDocument.title, searchResults: []};
                        var treeWalker = spineDocument.createTreeWalker(spineDocument.body, NodeFilter.SHOW_TEXT, function(node) {
                            if (node.nodeValue && node.nodeValue.trim().length > 0) { return NodeFilter.FILTER_ACCEPT } else  { return NodeFilter.FILTER_REJECT }
                        });
                        var nodeList = [];
                        var currentNode = treeWalker.currentNode;
                        currentNode = treeWalker.nextNode();
                        while (currentNode) {
                            while ((match = regex.exec(currentNode.nodeValue)) != null) {
                                var start = match.index;
                                var end = match.index + match.length - 1;
                                var range = spineDocument.createRange();
                                range.setStart(currentNode, start);
                                range.setEnd(currentNode, end);
                                var cfiRange = window.READIUM.reader.getRangeCfiFromDomRange(range);
                                cfiRange.idref = documentObject.spineItem.idref;
                                cfiRange.spineItemCfi = documentObject.spineItem.cfi;

                                var surroundingTextStart = 0;
                                var surroundingTextEnd = currentNode.nodeValue.length;
                                if (start > 50) {
                                    surroundingTextStart = start - 50;
                                }
                                if (surroundingTextEnd - end > 50) {
                                    surroundingTextEnd = end + 50;
                                }

                                var surroundingText = currentNode.nodeValue.substr(surroundingTextStart, surroundingTextEnd);
                                surroundingText = surroundingText.replace(match, '<mark>' + match + '</mark>');

                                nodeList.push({text: surroundingText, cfi: cfiRange, rootUrl: window.AllSpineDocuments[i].rootUrl})
                            }
                            currentNode = treeWalker.nextNode();
                        }
                        searchResults[i].spineDocuments[j].searchResults = nodeList;
                    }
                }
            }
            console.log(searchResults);
            for (var book of searchResults) {
                var bookContainer = document.createElement('div');

                var bookHeader = document.createElement('h2');
                bookHeader.textContent = book.title;
                bookContainer.appendChild(bookHeader);

                var chapterList = document.createElement('div');
                bookContainer.appendChild(chapterList);

                for (var chapter of book.spineDocuments) {
                    if (chapter.searchResults.length > 0) {
                        var container = document.createElement('div');

                        var header = document.createElement('h3');
                        header.textContent = chapter.title;
                        container.appendChild(header);

                        var list = document.createElement('div');
                        container.appendChild(list);

                        for (var result of chapter.searchResults) {
                            var textContainer = document.createElement('div');
                            textContainer.classList.add('searchResult');
                            (function(textContainer, result) {
                                textContainer.addEventListener('click', function() {
                                    console.log(result);
                                    window.localStorage.setItem('searchHighlight', JSON.stringify(result.cfi));
                                    window.location.href = window.location.origin + '/?epub=' + encodeURI(result.rootUrl) + '&goto=epubcfi(' + result.cfi.spineItemCfi + result.cfi.contentCFI + ')';
                                    // window.READIUM.reader.plugins.highlights.addHighlight(result.cfi.idref, result.cfi.contentCFI, PeBL.utils.getUuid(), "search-highlight");
                                });
                            })(textContainer, result);

                            var textContent = document.createElement('p');
                            textContent.innerHTML = result.text;
                            textContainer.appendChild(textContent);

                            list.appendChild(textContainer);
                        }
                        chapterList.append(container);
                    }
                }
                if ($(bookContainer).find('.searchResult').length !== 0)
                    $('#search-body-list').append(bookContainer);
            }
        }, 1000));
    }

    var readClick = function(e){
        var urlParams = Helpers.getURLQueryParams();
        //var ebookURL = urlParams['epub'];
        var libraryURL = urlParams['epubs'];
        var embedded = urlParams['embedded'];

        var ebookURL = $(this).attr('data-book');

	if (ebookURL && ebookURL.substr(0, 5) == "db://") {
	    StorageManager.getFile(ebookURL, function (data) {
		var eventPayload = {embedded: embedded, localPath : ebookURL, epub: data, epubs: libraryURL};
		$(window).triggerHandler('readepub', eventPayload);
	    });
	} else if (ebookURL) {
            var eventPayload = {embedded: embedded, epub: ebookURL, epubs: libraryURL};
            $(window).triggerHandler('readepub', eventPayload);
        }
        else {
            var libURL = $(this).attr('data-library');
            if (libURL) {

                // TODO: this doesn't work, so we refresh the whole page, bypassing pushState (replaceState is used instead after reload)
                // libraryManager.resetLibraryData();
                // var eventPayload = libURL;
                // $(window).triggerHandler('loadlibrary', eventPayload);

                var URLPATH =
                window.location ? (
                    window.location.protocol
                    + "//"
                    + window.location.hostname
                    + (window.location.port ? (':' + window.location.port) : '')
                    + window.location.pathname
                ) : 'index.html'
                ;

                var url = URLPATH + '?epubs=' + encodeURIComponent(libURL);

                window.location = url;
            } else {
                var linkURL = $(this).attr('data-link');
                if (linkURL) {
                    window.open(linkURL, '_blank');
                }
            }
        }
        return false;
    }

    var unloadLibraryUI = function(){

        // needed only if access keys can potentially be used to open a book while a dialog is opened, because keyboard.scope() is not accounted for with HTML access keys :(
        Dialogs.closeModal();
        Dialogs.reset();
        $('.modal-backdrop').remove();

        Keyboard.off('library');
        Keyboard.off('settings');

        $('#settings-dialog').off('hidden.bs.modal');
        $('#settings-dialog').off('shown.bs.modal');

        $('#about-dialog').off('hidden.bs.modal');
        $('#about-dialog').off('shown.bs.modal');

        $('#add-epub-dialog').off('hidden.bs.modal');
        $('#add-epub-dialog').off('shown.bs.modal');

        $('.details-dialog').off('hidden.bs.modal');
        $('.details-dialog').off('shown.bs.modal');

        $(window).off('resize');
        $(document.body).off('click');
        $(window).off('storageReady');
        $('#app-container').attr('style', '');
    }

    var promptForReplace = function(originalData, replaceCallback, keepBothCallback){
        Settings.get('replaceByDefault', function(val){
            if (val === 'true'){
                replaceCallback()
            }
            else{
                keepBothCallback();
            }
        })
    }

    var handleLibraryChange = function(){
        Dialogs.closeModal();
        libraryManager.retrieveAvailableEpubs(loadLibraryItems);
    }

    var importZippedEpub = function(file) {

        if (!window.Blob || !window.File) return;

        if (!(file instanceof Blob) || !(file instanceof File)) return;


        var title = Strings.import_dlg_title + " [ " + file.name + " ]";
        Dialogs.showModalProgress(title, Strings.import_dlg_message);

        libraryManager.handleZippedEpub({
            file: file,
            overwrite: promptForReplace,
            success: handleLibraryChange,
            progress: Dialogs.updateProgress,
            error: showError
        });
    };

    var importZippedEpubs_CANCELLED = false;
    var importZippedEpubs = function(files, i, callback) {

        if (!window.Blob || !window.File) return;

         if (i == 0) { // first call
            importZippedEpubs_CANCELLED = false;
        } else {
            if (importZippedEpubs_CANCELLED) {

                handleLibraryChange();

                setTimeout(function(){
                    Dialogs.showModalMessage(Strings.i18n_add_book, Strings.i18n_cancel + " - " + Strings.import_dlg_title);
                }, 800);

                return; // break the iteration
            }
        }

        if (i >= files.length) { // last call
            handleLibraryChange();
            return;
        }

        var nextImportEPUB = function(callback) {
            setTimeout(function(){
                //Dialogs.closeModal();
                //Dialogs.reset(); // ? (costly DOM mutations)
                importZippedEpubs(files, ++i, callback); // next
            }, 100); // time for the Web Worker to die (background unzipping)
        };

        var file = files[i];

        if (!(file instanceof Blob) || !(file instanceof File)) {

            nextImportEPUB();

            return;
        }

        var fileInfo = " [ " + file.name + " ] "+(i+1)+"/"+(files.length)+"";
        var title = Strings.import_dlg_title + fileInfo;
        if (i == 0) { // first call
            Dialogs.showModalProgress(title, Strings.import_dlg_message, function() {
                importZippedEpubs_CANCELLED = true;
                Dialogs.updateModalProgressTitle("(" + Strings.i18n_cancel + ") " + title);
            });
        } else {
            Dialogs.updateModalProgressTitle(title);
        }

        Dialogs.updateProgress(0, Messages.PROGRESS_EXTRACTING, file.name);

        libraryManager.handleZippedEpub({
            file: file,
            overwrite: promptForReplace,
            success: function() {
                if (callback) {
                    callback(i);
                    nextImportEPUB(callback);
                } else
                    nextImportEPUB();
            },
            progress: Dialogs.updateProgress,
            error: function(errorCode, data) {

                // TODO: collapse multiple errors into a single user prompt
                //showError(errorCode, data);

                var msg = Strings.err_unknown;
                switch(errorCode){
                    case Messages.ERROR_PACKAGE_PARSE:
                        Dialogs.updateModalProgressTitle(Strings.err_epub_corrupt + fileInfo);
                        //Dialogs.showErrorWithDetails(Strings.err_epub_corrupt, data);
                        return;
                    case Messages.ERROR_STORAGE:
                        msg = Strings.err_storage;
                        break;
                    case Messages.ERROR_EPUB:
                        msg = Strings.err_epub_corrupt;
                        break;
                    case Messages.ERROR_AJAX:
                        msg = Strings.err_ajax;
                        break;
                    default:
                        msg = Strings.err_unknown;
                        console.trace();
                        break;
                }
                Dialogs.updateModalProgressTitle(Strings.err_dlg_title + " (" + msg + ")" + fileInfo);
                //Dialogs.showModalMessage(Strings.err_dlg_title, msg);

                setTimeout(function(){
                    nextImportEPUB();
                }, 500); // short error report, then let's move to the next item.
            }
        });
    };


    var handleFileSelect = function(evt){
        $('#add-epub-dialog').modal('hide');

        if (evt.target.files.length > 1) {
            importZippedEpubs(evt.target.files, 0);
            return;
        }

        var file = evt.target.files[0];
	importZippedEpub(file);
    }

    var handleDirSelect = function(evt){
        var files = evt.target.files;
        $('#add-epub-dialog').modal('hide');
        Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
        libraryManager.handleDirectoryImport({
            files: files,
            overwrite: promptForReplace,
            success: handleLibraryChange,
            progress: Dialogs.updateProgress,
            error: showError
        });
    }

    var handleUrlSelect = function(){
        var url = $('#url-upload').val();
        $('#add-epub-dialog').modal('hide');
        Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
        libraryManager.handleUrlImport({
            url: url,
            overwrite: promptForReplace,
            success: handleLibraryChange,
            progress: Dialogs.updateProgress,
            error: showError
        });
    }

    var importEpub = function(ebook) {
        // TODO: also allow import of URL and directory select
        // See libraryManager.canHandleUrl() + handleUrlSelect()
        // See libraryManager.canHandleDirectory() + handleDirSelect()

        if (Array.isArray(ebook)) {
            importZippedEpubs(ebook, 0);
            return;
        }

        importZippedEpub(ebook);
    };

    var doMigration = function(){
        Dialogs.showModalProgress(Strings.migrate_dlg_title, Strings.migrate_dlg_message);
        libraryManager.handleMigration({
            success: function(){

                // Note: automatically JSON.stringify's the passed value!
                Settings.put('needsMigration', false, $.noop);

                handleLibraryChange();
            },
            progress: Dialogs.updateProgress,
            error: showError
        });
    }

    var blacklistEpub = function(url) {
        var blacklist = window.localStorage.getItem('blacklist');
        if (blacklist == null)
            blacklist = {};
        else
            blacklist = JSON.parse(blacklist);

        blacklist[url] = true;
        window.localStorage.setItem('blacklist', JSON.stringify(blacklist));
    };

    var storeLibraryOffline = function(callback) {
        StorageManager.getFile('db://epub_library.json', function(index) {
            if (index)
                window.tempBookshelf = index;
            else
                window.tempBookshelf = [];

            libraryManager.retrieveAvailableEpubs(function(epubs) {                
                console.log(epubs);
                if (epubs.length < 1)
                    callback();
                else {
                    var ebooks = [];
                    for (var epub of epubs) {
                        (function(epub) {
                            var url = epub.rootUrl;
                            var request = new XMLHttpRequest();
                            request.responseType = 'blob';
                            request.onload = function(data) {
                                var blob = this.response;
                                var file = new File([blob], url.split('/').pop());
                                ebooks.push(file);
                                if (ebooks.length === epubs.length) {
                                    importZippedEpubs(ebooks, 0, function(num) {
                                        if (ebooks.length === num + 1) {
                                            callback();
                                        }
                                    });
                                }
                            }
                            request.open('GET', url);
                            request.send();
                        })(epub);
                    }
                }
            });
        });
    };

    var storeBookOffline = function(rootUrl, callback) {
        StorageManager.getFile('db://epub_library.json', function(index) {
            if (index)
                window.existingBookshelf = index;
            else
                window.existingBookshelf = null;

                window.tempBookshelf = [];

            libraryManager.retrieveAvailableEpubs(function(epubs) {
                if (epubs.length < 1)
                    callback();
                else {
                    for (var epub of epubs) {
                        if (epub.rootUrl === rootUrl) {
                            var request = new XMLHttpRequest();
                            request.responseType = 'blob';
                            request.onload = function(data) {
                                var blob = this.response;
                                var file = new File([blob], rootUrl.split('/').pop());
                                importZippedEpubs([file], 0, function(num) {
                                    callback();
                                });
                            }
                            request.open('GET', rootUrl);
                            request.send();
                        }
                    }
                }
            });
        });
    }

    var loadLibraryUI = function(){
        var inIos = false;
        var inIosStandalone = false;
        // Detects if device is on iOS
        var isIos = function() {
          var userAgent = window.navigator.userAgent.toLowerCase();
          return /iphone|ipad|ipod/.test( userAgent );
        }
        // Detects if device is in standalone mode
        var isInStandaloneMode = function () {
            return ('standalone' in window.navigator) && (window.navigator.standalone);
        }

        // Checks if should display install popup notification:
        if (isIos()) {
            inIos = true;
        }
        if (isInStandaloneMode()) {
            inIosStandalone = true;
        }

        Dialogs.reset();

        Keyboard.scope('library');

        Analytics.trackView('/library');
        var $appContainer = $('#app-container');
        $appContainer.empty();

        $appContainer.append(AddEpubDialog({
            canHandleUrl : libraryManager.canHandleUrl(),
            canHandleDirectory : libraryManager.canHandleDirectory(),
            strings: Strings
        }));

        Versioning.getVersioningInfo(function(version){
            SettingsDialog.initDialog(undefined, version);
            $appContainer.append(AboutDialog({imagePathPrefix: moduleConfig.imagePathPrefix, strings: Strings, dateTimeString: version.dateTimeString, viewerJs: version.readiumJsViewer, readiumJs: version.readiumJs, sharedJs: version.readiumSharedJs, cfiJs: version.readiumCfiJs}));
        });

        $appContainer.append(DownloadBooksDialog({
            strings: Strings
        }));

        $appContainer.append(InstallReaderDialog({
            strings: Strings
        }));

        $appContainer.append(InstallIosReaderDialog({
            strings: Strings,
            imagePathPrefix: moduleConfig.imagePathPrefix
        }));

        $appContainer.append(SpinnerDialog({
            strings: Strings
        }));

        $('#about-dialog').on('hidden.bs.modal', function () {
            Keyboard.scope('library');

            setTimeout(function(){ $("#aboutButt1").focus(); }, 50);
        });
        $('#about-dialog').on('shown.bs.modal', function(){
            Keyboard.scope('about');
        });

        $('#add-epub-dialog').on('hidden.bs.modal', function () {
            Keyboard.scope('library');

            setTimeout(function(){ $("#addbutt").focus(); }, 50);
        });
        $('#add-epub-dialog').on('shown.bs.modal', function(){
            Keyboard.scope('add');

            $('#add-epub-dialog input').val('');

            setTimeout(function(){ $('#closeAddEpubCross')[0].focus(); }, 1000);
        });
        $('#url-upload').on('keyup', function(){
            var val = $(this).val();
            if (val && val.length){
                $('#add-epub-dialog .add-book').prop('disabled', false);
            }
            else{
                $('#add-epub-dialog .add-book').prop('disabled', true);
            }
        });
        $('.add-book').on('click', handleUrlSelect);
        $('nav').empty();
        $('nav').attr("aria-label", Strings.i18n_toolbar);
        $('nav').append(LibraryNavbar({strings: Strings, dialogs: Dialogs, keyboard: Keyboard, inIos: inIos}));
        $('.icon-list-view').on('click', function(){
            $(document.body).addClass('list-view');
            setTimeout(function(){ $('.icon-thumbnails')[0].focus(); }, 50);
        });
        $('.icon-thumbnails').on('click', function(){
            $(document.body).removeClass('list-view');
            setTimeout(function(){ $('.icon-list-view')[0].focus(); }, 50);
        });
        PeBL.extension.hardcodeLogin.hookLoginButton("loginButt");
        findHeightRule();
        setItemHeight();
        StorageManager.initStorage(function(){
            libraryManager.retrieveAvailableEpubs(loadLibraryItems);
        }, showError);

        Keyboard.on(Keyboard.ShowSettingsModal, 'library', function(){$('#settings-dialog').modal("show");});

        $(window).trigger('libraryUIReady');
        $(window).on('resize', setItemHeight);

        var setAppSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
        }
        $(window).on('resize', setAppSize);
        $('#app-container').css('overflowY', 'auto');

        setAppSize();
        $(document.body).on('click', '.read', readClick);
        $('#epub-upload').on('change', handleFileSelect);
        $('#dir-upload').on('change', handleDirSelect);

        $(document.body).on('click', '.delete-book-button', function(evt) {
            var url = $(evt.currentTarget).attr('data-root');
            if (url.substr(0, 5) == 'db://') {
                StorageManager.deleteFile(url, function() {
                    StorageManager.getFile('db://epub_library.json', function(index) {
                        if (index) {
                            for (var i = 0; i < index.length; i++) {
                                if (index[i].rootUrl === url) {
                                    index.splice(i, 1);
                                    StorageManager.saveBookshelf('db://epub_library.json', index, function() {
                                        console.log('deleted epub_library.json entry');
                                        libraryManager.retrieveAvailableEpubs(loadLibraryItems);
                                    }, function() {
                                        console.log('failed to delete epub_library.json entry');
                                    });
                                }
                            }
                        } else {
                            console.log('No associated epub_library.json found');
                        }
                    });
                }, function() {
                    console.log('delete failed');
                });
            } else {
                libraryManager.retrieveAvailableEpubs(loadLibraryItems);
            }

        });

        $(document.body).on('click', '.download-book-button', function(evt) {
            var url = $(evt.currentTarget).attr('data-root');
            $('#install-spinner-dialog').modal('show');
            spinLibrary(true);
            storeBookOffline(url, function() {
                if (window.existingBookshelf) {
                    for (var i = 0; i < window.existingBookshelf.length; i++) {
                        if (window.existingBookshelf[i].title === window.tempBookshelf[0].title) {
                            window.existingBookshelf.splice(i, 1);
                            break;
                        }
                    }
                }
                if (window.existingBookshelf) {
                    window.tempBookshelf = window.tempBookshelf.concat(window.existingBookshelf);
                }
                StorageManager.saveBookshelf('db://epub_library.json', window.tempBookshelf, function() {
                    spinLibrary(false);
                    $('#install-spinner-dialog').modal('hide');
                }, function() {
                    console.log('error thing');
                });
            });
        });

        // if (inIos && !inIosStandalone) {
            // $(document.body).on('click', '#installbutt2', function() {
            //     $('#install-ios-reader-dialog').modal('show');
            // });
        //}

        // if (inIos && inIosStandalone) {
            // $(document.body).on('click', '#installbutt2', function() {
            //     $('#download-books-dialog').modal('show');
            // });
            // $('#download-books-submit')[0].addEventListener('click', function() {
            //     $('#install-spinner-dialog').modal('show');
            //     spinLibrary(true);
            //     storeLibraryOffline(function() {
            //         console.log(window.tempBookshelf);
            //         StorageManager.saveBookshelf('db://epub_library.json', window.tempBookshelf, function() {
            //             spinLibrary(false);
            //             setTimeout(function() {
            //                 libraryManager.retrieveAvailableEpubs(loadLibraryItems);
            //             }, 1000);
            //             $('#install-spinner-dialog').modal('hide');
            //         }, function() {
            //             console.log('error thing');
            //         });

            //     });
            // });
        //}


        document.title = Strings.i18n_pebl_library;

        $('#settings-dialog').on('hidden.bs.modal', function () {

            Keyboard.scope('library');

            setTimeout(function(){ $("#settbutt1").focus(); }, 50);

            $("#buttSave").removeAttr("accesskey");
            $("#buttClose").removeAttr("accesskey");
        });
        $('#settings-dialog').on('shown.bs.modal', function () {

            Keyboard.scope('settings');

            $("#buttSave").attr("accesskey", Keyboard.accesskeys.SettingsModalSave);
            $("#buttClose").attr("accesskey", Keyboard.accesskeys.SettingsModalClose);
        });






        var isChromeExtensionPackagedApp_ButNotChromeOS = (typeof chrome !== "undefined") && chrome.app
            && chrome.app.window && chrome.app.window.current // a bit redundant?
            && !/\bCrOS\b/.test(navigator.userAgent);

        // test whether we are in the Chrome app.  If so, put up the dialog and whine at the users...
        if (isChromeExtensionPackagedApp_ButNotChromeOS) {
            setTimeout(function() {
                Dialogs.showModalHTML(Strings.i18n_ChromeApp_deprecated_dialog_title, Strings.i18n_ChromeApp_deprecated_dialog_HTML);
            }, 800);
        }

        //async in Chrome
        Settings.get("needsMigration", function(needsMigration){
            if (needsMigration){
                doMigration();
            }
        });

        window.addEventListener('message', function(event) {
            console.log(event);
            var data = JSON.parse(event.data);
            if (data.message === 'extensionDashboardSync') {
                var handleSync = function() {
                    window.extensionDashboard = {};
                    window.extensionDashboard.programID = data.programID;
                    window.extensionDashboard.userProfile = data.userProfile;
                    window.extensionDashboard.programTitle = data.programTitle;
                    window.extensionDashboard.isAdmin = data.isAdmin;
                    if (data.userProfile) {
                        PeBL.emitEvent(PeBL.events.eventLoggedIn, data.userProfile);
                        window.Lightbox.close();
                    }

                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                    }

                    console.log('SUCCESS');
                }

                window.PeBL.user.isLoggedIn(function(isLoggedIn) {
                    if (isLoggedIn) {
                        window.PeBL.user.getUser(function(userProfile) {
                            if (userProfile.identity !== data.userProfile.identity || (window.extensionDashboard && window.extensionDashboard.programID && (window.extensionDashboard.programID !== data.programID))) {
                                setTimeout(function() {
                                    window.location.href = window.location.href;
                                }, 10);
                                handleSync();
                            } else {
                                handleSync();
                            }
                        });
                    } else {
                        handleSync();
                    }
                });
            }
        }, false);

        if (window.opener) {
            var urlParams = new URLSearchParams(window.location.search);
            var redirectUrl = urlParams.get('redirectUrl');
            var message = {
                "message": "bookshelfLoaded"
            }

            if (redirectUrl) {
                message.redirectUrl = unescape(redirectUrl);
            }

            window.opener.postMessage(JSON.stringify(message), '*');
        }

    }

    var applyKeyboardSettingsAndLoadUi = function(data)
    {
	PeBL.emitEvent(PeBL.events.newBook, "Library");
        if (data && data.epubs && (typeof data.epubs == "string")) {

            // this is normally init'ed at page launch using the "epubs" URL GET query parameter,
            // but needs manually setting when using pushState() to refresh the page contents with a different library source
            moduleConfig.epubLibraryPath = data.epubs;
        }

        // override current scheme with user options
        Settings.get('reader', function(json)
        {
           Keyboard.applySettings(json);

           loadLibraryUI();

           if (data && data.importEPUB) { // File/Blob, possibly Array
               importEpub(data.importEPUB);
           }
        });
    };
    window.setReplaceByDefault = function(replace){
        // Note: automatically JSON.stringify's the passed value!
        Settings.put('replaceByDefault', String(replace));
    }
    return {
        loadUI : applyKeyboardSettingsAndLoadUi,
        unloadUI : unloadLibraryUI,
        importEpub : importEpub
    };
});
