/**
 * Angular JS multiple-selection module
 * @author Maksym Pomazan
 * @version 0.0.5
 */
function getSelectableElements(element) {
    var out = [];
    var childs = element.children();
    for (var i = 0; i < childs.length; i++) {
        var child = angular.element(childs[i]);
        if (child.scope().isSelectable) {
            out.push(child);
        } else {
            if (child.scope().$id!=element.scope().$id && child.scope().isSelectableZone === true) {

            } else {
                out = out.concat(getSelectableElements(child));
            }
        }
    }
    return out;
}

function offset(element) {
    var documentElem,
        box = {
            top: 0,
            left: 0
        },
        doc = element && element.ownerDocument;
    documentElem = doc.documentElement;

    if (typeof element.getBoundingClientRect !== undefined) {
        box = element.getBoundingClientRect();
    }

    return {
        top: box.top + (window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
        left: box.left + (window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0)
    };
}
angular.module('multipleSelection', [])
    .directive('multipleSelectionItem', ['$rootScope', function($rootScope) {
        return {
            scope: true,
            restrict: 'A',
            link: function(scope, element, iAttrs, controller) {

                scope.isSelectable = true;
                scope.isSelected = false;

                element.on('mousedown', function(event) {
                    if (element.scope().isSelected) {
                        if (event.ctrlKey || event.metaKey || event.shiftKey) {
                            element.scope().isSelected = false;
                            $rootScope.$emit('selection:deselect', childs[i].scope());
                            element.scope().$apply();
                        }
                    } else {
                        if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
                            var childs = getSelectableElements(element.parent());
                            for (var i = 0; i < childs.length; i++) {
                                if (childs[i].scope().isSelectable) {
                                    if (childs[i].scope().isSelected === true) {
                                        childs[i].scope().isSelected = false;
                                        $rootScope.$emit('selection:deselect', childs[i].scope());
                                        childs[i].scope().$apply();
                                    }
                                }
                            }
                        }
                        element.scope().isSelected = true;
                        $rootScope.$emit('selection:select', element.scope());
                        element.scope().$apply();

                    }
                    event.stopPropagation();
                });
            }
        };
    }])
    .directive('multipleSelectionZone', ['$rootScope', '$document', function($rootScope, $document) {
        return {
            scope: true,
            restrict: 'A',
            link: function(scope, element, iAttrs, controller) {

                scope.isSelectableZone = true;

                var startX = 0,
                    startY = 0;
                var helper;

                function getMouseEventPosition(event) {
                    if (event.pageX || event.pageY) {
                        return {
                            x: event.pageX,
                            y: event.pageY
                        };
                    }
                    return {
                        x: event.clientX + document.documentElement.scrollLeft,
                        y: event.clientY + document.documentElement.scrollTop
                    };
                }

                /**
                 * Check that 2 boxes hitting
                 * @param  {Object} box1
                 * @param  {Object} box2
                 * @return {Boolean} is hitting
                 */
                function checkElementHitting(box1, box2) {
                    return (box2.beginX <= box1.beginX && box1.beginX <= box2.endX || box1.beginX <= box2.beginX && box2.beginX <= box1.endX) &&
                        (box2.beginY <= box1.beginY && box1.beginY <= box2.endY || box1.beginY <= box2.beginY && box2.beginY <= box1.endY);
                }

                /**
                 * Transform box to object to:
                 *  beginX is always be less then endX
                 *  beginY is always be less then endY
                 * @param  {Number} startX
                 * @param  {Number} startY
                 * @param  {Number} endX
                 * @param  {Number} endY
                 * @return {Object} result Transformed object
                 */
                function transformBox(startX, startY, endX, endY) {

                    var result = {};

                    if (startX > endX) {
                        result.beginX = endX;
                        result.endX = startX;
                    } else {
                        result.beginX = startX;
                        result.endX = endX;
                    }
                    if (startY > endY) {
                        result.beginY = endY;
                        result.endY = startY;
                    } else {
                        result.beginY = startY;
                        result.endY = endY;
                    }
                    return result;
                }

                /**
                 * Method move selection helper
                 * @param  {Element} hepler
                 * @param  {Number} startX
                 * @param  {Number} startY
                 * @param  {Number} endX
                 * @param  {Number} endY
                 */
                function moveSelectionHelper(hepler, startX, startY, endX, endY) {

                    var box = transformBox(startX, startY, endX, endY);

                    helper.css({
                        "top": box.beginY + "px",
                        "left": box.beginX + "px",
                        "width": (box.endX - box.beginX) + "px",
                        "height": (box.endY - box.beginY) + "px"
                    });
                }


                /**
                 * Method on Mouse Move
                 * @param  {Event} @event
                 */
                function mousemove(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    var eventPosition = getMouseEventPosition(event);
                    // Move helper
                    moveSelectionHelper(helper, startX, startY, eventPosition.x, eventPosition.y);
                    // Check items is selecting
                    var childs = getSelectableElements(element);
                    for (var i = 0; i < childs.length; i++) {
                        if (checkElementHitting(transformBox(offset(childs[i][0]).left, offset(childs[i][0]).top, offset(childs[i][0]).left + childs[i].prop('offsetWidth'), offset(childs[i][0]).top + childs[i].prop('offsetHeight')), transformBox(startX, startY, eventPosition.x, eventPosition.y))) {
                            if (childs[i].scope().isSelected === false) {
                                childs[i].scope().isSelected = true;
                                $rootScope.$emit('selection:select', childs[i].scope());
                                childs[i].scope().$apply();
                            }
                        } else if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
                            if (childs[i].scope().isSelected === true) {
                                childs[i].scope().isSelected = false;
                                $rootScope.$emit('selection:deselect', childs[i].scope());
                                childs[i].scope().$apply();
                            }
                        }
                    }
                }



                /**
                 * Event on Mouse up
                 * @param  {Event} event
                 */
                function mouseup(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    var eventPosition = getMouseEventPosition(event);
                    // Remove helper
                    helper.remove();
                    // Remove listeners
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                }

                element.on('mousedown', function(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    var eventPosition = getMouseEventPosition(event);
                    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
                        // Skip all selected or selecting items
                        var childs = getSelectableElements(element);
                        for (var i = 0; i < childs.length; i++) {
                            if (childs[i].scope().isSelected === true) {
                                childs[i].scope().isSelected = false;
                                $rootScope.$emit('selection:deselect', childs[i].scope());
                                childs[i].scope().$apply();
                            }
                        }
                    }
                    // Update start coordinates
                    startX = eventPosition.x;
                    startY = eventPosition.y;
                    // Create helper
                    helper = angular
                        .element("<div></div>")
                        .addClass('select-helper');

                    $document.find('body').eq(0).append(helper);
                    // Attach events
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });
            }
        };
    }]);
