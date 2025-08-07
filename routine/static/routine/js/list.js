document.addEventListener('DOMContentLoaded', function () {
    // Attach click handler to all Details buttons
    document.querySelectorAll('.btn-info').forEach(btn => {
        btn.addEventListener('click', function (e) {
            // If using AJAX panel injection, prevent default and load panel
            if (this.closest('.routine-list')) {
                e.preventDefault();
                const url = this.getAttribute('href');
                const panel = document.getElementById('panel-detail');
                if (panel && url) {
                    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                        .then(res => res.text())
                        .then(html => {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            const content = tempDiv.querySelector('.routine-detail') || tempDiv.querySelector('main > div');
                            panel.innerHTML = content ? content.outerHTML : html;
                            panel.classList.add('active');
                            panel.dataset.loaded = "true";
                            // Initialize detail JS
                            if (typeof initRoutineDetail === "function") {
                                initRoutineDetail();
                            }
                        })
                        .catch(error => {
                            console.error('Error loading detail panel:', error);
                        });
                }
            }
        });
    });
});