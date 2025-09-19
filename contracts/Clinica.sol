// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract Clinica {

    struct Paciente {
        string nome;
        string cpf;
        uint idade;
        string enderecoPaciente;
        bool existe;
    }

    mapping(string => Paciente) private pacientes;
    string[] private cpfs;

    event PacienteCadastrado(string cpf, string nome, uint idade);

    function cadastrarPaciente(
        string memory _nome,
        string memory _cpf,
        uint _idade,
        string memory _enderecoPaciente
    ) public {

        string memory cpfTrimmed = _cpf; // Opcional: você pode aplicar mais normalização se quiser

        require(bytes(_nome).length > 0, "Nome obrigatorio");
        require(bytes(cpfTrimmed).length > 0, "CPF obrigatorio");
        require(_idade > 12, "Paciente deve ter mais de 12 anos");
        require(!pacientes[cpfTrimmed].existe, "CPF digitado errado ou ja cadastrado");

        pacientes[cpfTrimmed] = Paciente({
            nome: _nome,
            cpf: cpfTrimmed,
            idade: _idade,
            enderecoPaciente: _enderecoPaciente,
            existe: true
        });

        cpfs.push(cpfTrimmed);
        emit PacienteCadastrado(cpfTrimmed, _nome, _idade);
    }

    function obterPaciente(string memory _cpf) public view returns (
        string memory nome,
        uint idade,
        string memory enderecoPaciente
    ) {
        require(pacientes[_cpf].existe, "Paciente nao encontrado");

        Paciente memory p = pacientes[_cpf];
        return (p.nome, p.idade, p.enderecoPaciente);
    }

    function listarCPFs() public view returns (string[] memory) {
        return cpfs;
    }
}
