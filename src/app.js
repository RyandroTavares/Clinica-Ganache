document.addEventListener('DOMContentLoaded', async () => {

    const web3 = new Web3('http://127.0.0.1:7545');
    const contratoAddress = "0x72Ed8e125F4C252B096936A524aC069744639D28";
    const contratoABI = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "cpf",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "nome",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "idade",
                    "type": "uint256"
                }
            ],
            "name": "PacienteCadastrado",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_nome",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_cpf",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_idade",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_enderecoPaciente",
                    "type": "string"
                }
            ],
            "name": "cadastrarPaciente",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_cpf",
                    "type": "string"
                }
            ],
            "name": "obterPaciente",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "nome",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "idade",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "enderecoPaciente",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
        },
        {
            "inputs": [],
            "name": "listarCPFs",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
        }
    ];
    const contrato = new web3.eth.Contract(contratoABI, contratoAddress);

    const privateKey = "8f42eac2754307bb36d0618ecfb02e1f4d59f87a6ba27526420e544ea78b4cdd";
    const account = web3.eth.accounts.privateKeyToAccount("0x" + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    function normalizeCPF(cpf) {
        return cpf.replace(/\D/g, '');
    }

    const mensagemCadastro = document.getElementById('mensagemCadastro');
    const formCadastro = document.getElementById('cadastrarForm');

    // ================= Cadastro =================
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const cpf = normalizeCPF(document.getElementById('cpf').value);
        const idade = parseInt(document.getElementById('idade').value);
        const endereco = document.getElementById('endereco').value;

        mensagemCadastro.style.color = "green";

        try {
            await contrato.methods.cadastrarPaciente(nome, cpf, idade, endereco)
                .send({ from: account.address, gas: 3000000 });
            mensagemCadastro.innerHTML = "Paciente cadastrado com sucesso!";
            listarPacientes();
            formCadastro.reset();
        } catch (err) {
            mensagemCadastro.style.color = "red";

            let msg = "";
            if (err?.data) {
                const keys = Object.keys(err.data);
                if (keys.length > 0 && err.data[keys[0]].reason) {
                    msg = err.data[keys[0]].reason;
                }
            }
            if (!msg && err.message) {
                const match = err.message.match(/revert (.*)/);
                if (match) msg = match[1];
            }

            // Exibe mensagens amigáveis
            if (msg.includes("Paciente deve ter mais de 12 anos")) {
                mensagemCadastro.innerHTML = "Erro ao cadastrar paciente: Paciente deve ter mais de 12 anos";
            } else if (msg.includes("CPF digitado errado ou ja cadastrado")) {
                mensagemCadastro.innerHTML = "Erro ao cadastrar paciente: CPF inválido ou já cadastrado";
            } else if (msg.includes("CPF obrigatorio")) {
                mensagemCadastro.innerHTML = "Erro ao cadastrar paciente: CPF inválido";
            } else {
                mensagemCadastro.innerHTML = "Erro ao cadastrar paciente";
            }
        }
    });

    // ================= Consulta por CPF =================
    const formConsulta = document.getElementById('consultarForm');
    const resultadoDiv = document.getElementById('resultadoConsulta');
    const mensagemConsulta = document.getElementById('mensagemConsulta');

    formConsulta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cpf = normalizeCPF(document.getElementById('cpfConsulta').value);
        try {
            const paciente = await contrato.methods.obterPaciente(cpf).call();
            resultadoDiv.innerHTML = `
                <div class="patient-card">
                    <h3>${paciente.nome}</h3>
                    <p>CPF: ${cpf}</p>
                    <p class="idade">Idade: ${paciente.idade}</p>
                    <p>Endereço: ${paciente.enderecoPaciente}</p>
                </div>`;
            mensagemConsulta.innerHTML = "";
        } catch {
            resultadoDiv.innerHTML = "";
            mensagemConsulta.innerHTML = "Paciente não encontrado";
        }
    });

    // ================= Listar Todos =================
    const container = document.getElementById('listaPacientes');
    async function listarPacientes() {
        if (!container) return;
        container.innerHTML = "";
        const cpfs = await contrato.methods.listarCPFs().call();
        for (const cpf of cpfs) {
            try {
                const paciente = await contrato.methods.obterPaciente(cpf).call();
                const card = document.createElement('div');
                card.className = "patient-card";
                card.innerHTML = `
                    <h3>${paciente.nome}</h3>
                    <p>CPF: ${cpf}</p>
                    <p class="idade">Idade: ${paciente.idade}</p>
                    <p>Endereço: ${paciente.enderecoPaciente}</p>`;
                container.appendChild(card);
            } catch { }
        }
    }

    document.getElementById('btnListarTodos').addEventListener('click', listarPacientes);

    listarPacientes();
});
