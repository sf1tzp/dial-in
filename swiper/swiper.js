         const swiper = document.getElementById("swipe");
            swiper.addEventListener("scroll", on_scroll);

            function on_scroll(e) {
                const scroll_div = e.currentTarget;
                const scroll_center = scroll_div.scrollWidth / 2;
                const viewport_center = scroll_div.clientWidth / 2;
                const current = scroll_div.scrollLeft + viewport_center;
                const dx = current - scroll_center;
                console.log(dx);
            }

            const holds = document.querySelectorAll(".hold");
            holds.forEach((hold_parent) => {
                const hold = hold_parent.children[1];
                requestAnimationFrame(() => {
                    hold_parent.scrollLeft = hold.offsetLeft;
                });
            });