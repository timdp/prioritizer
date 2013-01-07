var Prioritizer = function () {
    "use strict";

    var config = {
        backend: "./api.json",
        minFontSize: 10,
        maxFontSize: 100,
        draggableSpacing: 10,
        insert: true,
        dontSave: false
    };

    var options;
    var container;
    var draggablesContainer;
    var draggables;
    var droppablesContainer;
    var droppables;

    function init(_options, _order) {
        options = _options;
        buildUI();
        makeInteractive();
        if (_order) {
            setOrder(_order, true);
        }
    }

    function buildUI() {
        createComponents();
        stretchDraggables();
        positionDraggables();
        createDefaultAreas();
    }

    function createComponents() {
        container = $("container");
        draggablesContainer = new Element("div", {
            id: "draggables"
        });
        droppablesContainer = new Element("div", {
            id: "droppables"
        });
        var instructions = new Element("div", {
            id: "instructions",
            text: "Drag the options in your preferred order."
                + " Your choice is automatically saved."
        });
        container.empty().adopt(
            draggablesContainer, droppablesContainer,
            instructions);
        options.each(function (o, idx) {
            makeBlock("draggable", idx + 1, o, draggablesContainer);
            makeBlock("droppable", idx + 1, idx + 1, droppablesContainer);
        });
        draggables = draggablesContainer.getChildren("div");
        droppables = droppablesContainer.getChildren("div");
    }

    function makeBlock(type, number, text, container) {
        var block = new Element("div", {
            id:      type + number,
            "class": type
        });
        if (!("dataset" in block)) block.dataset = {};
        block.dataset.number = number;
        block.grab(new Element("span", { text: text }));
        container.grab(block);
    }

    function stretchDraggables() {
        var totalSpacing = config.draggableSpacing * (draggables.length - 1);
        var maxWidth = draggablesContainer.getSize().x;
        var fontSize = config.maxFontSize;
        draggables.setStyle("font-size", fontSize + "px");
        var width = totalSpacing;
        draggables.each(function (d) {
            width += d.getSize().x;
        });
        while (fontSize > config.minFontSize && width > maxWidth) {
            --fontSize;
            draggables.setStyle("font-size", fontSize + "px");
            width = totalSpacing;
            draggables.each(function (d) {
                width += d.getSize().x;
            });
        }
        draggablesContainer.setStyle("height",
        draggables[0].getSize().y + "px");
        droppablesContainer.setStyle("font-size", fontSize + "px");
    }

    function positionDraggables() {
        var maxWidth = draggablesContainer.getSize().x;
        var width = 0;
        draggables.each(function (d) {
            width += d.getSize().x;
        });
        var actualSpacing = (maxWidth - width) / (draggables.length - 1);
        var left = 0;
        draggables.each(function (d) {
            var size = d.getSize();
            d.dataset.originalWidth = size.x;
            d.dataset.originalHeight = size.y;
            d.dataset.originalTop = d.getPosition(container).y;
            d.dataset.originalLeft = left;
            d.setStyles({
                "float": "none",
                position: "absolute",
                left: left + "px"
            });
            left += size.x + actualSpacing;
        });
    }

    function createDefaultAreas() {
        draggables.each(function (d) {
            draggablesContainer.grab(new Element("div", {
                "class": "area",
                styles: {
                    position: "absolute",
                    top: 0,
                    left: d.dataset.originalLeft + "px",
                    width: d.dataset.originalWidth + "px",
                    height: d.dataset.originalHeight + "px"
                }
            }));
        });
    }

    function makeInteractive() {
        draggables.makeDraggable({
            droppables: droppables,
            onStart: function (draggable) {
                draggablesContainer.removeClass("valid");
                detach(draggable);
                draggable.addClass("dragging");
            },
            onEnter: function (draggable, droppable) {
                if ("contents" in droppable.dataset) {
                    var other = $(droppable.dataset.contents);
                    other.addClass("replaceable");
                } else {
                    draggable.addClass("droppable");
                    droppable.addClass("active");
                }
            },
            onLeave: function (draggable, droppable) {
                if ("contents" in droppable.dataset) {
                    var other = $(droppable.dataset.contents);
                    other.removeClass("replaceable");
                }
                draggable.removeClass("droppable");
                droppable.removeClass("active");
            },
            onDrop: function (draggable, droppable) {
                draggable.removeClass("droppable");
                draggable.removeClass("dragging");
                if (droppable) {
                    if ("contents" in droppable.dataset) {
                        var other = $(droppable.dataset.contents);
                        other.removeClass("replaceable");
                        insertOrReplace(draggable, droppable);
                    } else {
                        attach(draggable, droppable);
                    }
                    checkValidity();
                } else {
                    restore(draggable);
                }
            }
        });
    }

    function insertOrReplace(draggable, droppable) {
        if (config.insert) {
            insert(draggable, droppable, false)
                || insert(draggable, droppable, true);
        } else {
            detach(other);
            restore(other);
        }
    }

    function insert(draggable, droppable, backwards) {
        var free = findFree(droppable, backwards);
        if (!free) {
            return false;
        }
        var iterate = backwards
            ? Element.prototype.getNext : Element.prototype.getPrevious;
        while (free != droppable) {
            var sib = iterate.call(free);
            attach($(sib.dataset.contents), free);
            free = sib;
        }
        attach(draggable, free);
        return true;
    }

    function findFree(droppable, backwards) {
        var iterate = backwards
            ? Element.prototype.getPrevious : Element.prototype.getNext;
        var sib = iterate.call(droppable);
        while (sib && "contents" in sib.dataset) {
            sib = iterate.call(sib);
        }
        return sib;
    }

    function getOrder() {
        var order = [];
        draggables.each(function (d) {
            var val = ("container" in d.dataset)
                ? $(d.dataset.container).dataset.number : null;
            order.push(val);
        });
        return order;
    }

    function setOrder(order, dontSave) {
        order.each(function (pos, idx) {
            if (pos) {
                attach(draggables[idx], droppables[pos - 1]);
            } else {
                detach(draggables[idx]);
                restore(draggables[idx]);
            }
        });
        checkValidity(dontSave);
    }

    function attach(draggable, droppable) {
        draggable.addClass("dropped");
        draggable.morph({
            width: droppable.getSize().x,
            top: droppable.getPosition(container).y,
            left: 0
        });
        droppable.dataset.contents = draggable.id;
        draggable.dataset.container = droppable.id;
    }

    function detach(draggable) {
        draggable.removeClass("dropped");
        if ("container" in draggable.dataset) {
            delete $(draggable.dataset.container).dataset.contents;
            delete draggable.dataset.container;
        }
    }

    function restore(draggable) {
        draggable.morph({
            width: draggable.dataset.originalWidth,
            top: draggable.dataset.originalTop,
            left: draggable.dataset.originalLeft
        });
    }

    function checkValidity(dontSave) {
        var order = getOrder();
        var i = 0;
        while (i < order.length && order[i]) {
            i++;
        }
        if (i < options.length) {
            return false;
        }
        draggablesContainer.addClass("valid");
        if (!dontSave && !config.dontSave) {
            prepareRequest(function (rJson) {
                if (!rJson || !rJson.success) {
                    alert("Error: invalid response.");
                }
            }).post({
                order: order.join(",")
            });
        }
        return true;
    }

    function prepareRequest(onSuccess, onFailure) {
        if (!onSuccess) {
            onSuccess = function () {};
        }
        if (!onFailure) {
            onFailure = function () {
                alert("Error: request failed.");
            };
        }
        return new Request.JSON({
            url: config.backend,
            onRequest: function () {
                $(document.body).addClass("busy");
            },
            onSuccess: function (rJson, rTxt) {
                $(document.body).removeClass("busy");
                onSuccess(rJson);
            },
            onFailure: function () {
                $(document.body).removeClass("busy");
                onFailure();
            },
            link: "cancel"
        });
    }

    return {
        config: config,
        init: init,
        prepareRequest: prepareRequest
    };
}();

window.addEvent("load", function () {
    Prioritizer.prepareRequest(function (rJson) {
        if (rJson && rJson.options) {
            Prioritizer.init(rJson.options, rJson.order);
        } else {
            alert("The application could not be started.");
        }
    }).get({
        t: Date.now()
    });
});